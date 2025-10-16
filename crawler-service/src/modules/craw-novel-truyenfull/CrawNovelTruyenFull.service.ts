import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';
import { MyChapter } from 'src/common/interface/chapter.entity';
import { FullInfoNovel } from 'src/common/interface/novel.entity';
import { htmlToPlainText } from 'src/utils/constants';

@Injectable()
export class CrawNovelTruyenFullService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
  ) {}

  async crawlNovelList(currentUserId: string, listUrl: string) {
    const response = await axios.get<string>(listUrl);
    const $ = cheerio.load(response.data);

    const novels: {
      title: string;
      url: string;
    }[] = [];

    $('#list-page .list.list-truyen .row').each((index, el) => {
      const title = $(el).find('h3.truyen-title a').text().trim();
      const url = $(el).find('h3.truyen-title a').attr('href');
      if (title && url) novels.push({ title, url });
    });

    for (const novel of novels) {
      await this.crawlNovelDetail(currentUserId, novel.url);
    }

    return {
      success: true,
      message: 'Crawling novel list completed',
      total: novels.length,
    };
  }

  async crawlNovelDetail(currentUserId: string, url: string) {
    const response = await axios.get<string>(url);
    const $ = cheerio.load(response.data);

    const title = $('h3.title').text().trim();
    const coverUrl = $('.book img').attr('src') || '';
    const authorName = $('.info a[href*="tac-gia"]').text().trim();
    const description = htmlToPlainText($('.desc-text').html());

    const statusText = $('.info .text-success, .info .text-primary')
      .text()
      .trim()
      .toLowerCase();
    const isCompleted = statusText.includes('full');

    const genres: string[] = [];
    $('.info a[href*="the-loai"]').each((_, el) => {
      genres.push($(el).text().trim());
    });

    console.log(`Start crawling novel: ${title}`);

    const novel = await firstValueFrom<FullInfoNovel>(
      this.novelClient.send(
        { cmd: 'novel.create-from-crawler' },
        {
          title,
          authorName,
          contributorId: currentUserId,
          description,
          genres: genres.length > 3 ? genres.slice(0, 3) : genres,
          coverUrl,
        },
      ),
    );

    // console.log(`Created novel success: ${novel.title} (ID: ${novel.id})`);
    // console.log(`Crawling chapters for novel: ${novel.title}`);
    await this.crawlAllChapters(currentUserId, novel, url);
    await firstValueFrom<FullInfoNovel>(
      this.novelClient.send(
        { cmd: 'novel.complete' },
        {
          id: novel.id,
          currentUserId,
          isCompleted,
        },
      ),
    );
    const crawlNovel = await firstValueFrom<FullInfoNovel>(
      this.novelClient.send(
        { cmd: 'novel.publish' },
        {
          id: novel.id,
          currentUserId,
          isPublished: true,
        },
      ),
    );
    console.log(`Finished crawling novel: ${novel.title}`);
    return crawlNovel;
  }

  async crawlAllChapters(
    currentUserId: string,
    novel: FullInfoNovel,
    baseUrl: string,
  ) {
    let page = 1;
    while (true) {
      const url =
        page === 1 ? baseUrl : `${baseUrl}/trang-${page}/#list-chapter`;
      const response = await axios.get<string>(url);
      const $ = cheerio.load(response.data);

      const chapterLinks = $('#list-chapter ul.list-chapter li a')
        .map((index, chapterLink) => $(chapterLink).attr('href'))
        .get();

      if (chapterLinks.length === 0) break;

      for (const link of chapterLinks) {
        await this.crawlChapterDetail(currentUserId, novel, link);
      }

      const nextPage = $(
        '.pagination a:has(span.sr-only:contains("Trang tiếp"))',
      ).attr('href');
      if (!nextPage) break;

      page++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async crawlChapterDetail(
    currentUserId: string,
    novel: FullInfoNovel,
    chapterUrl: string,
  ) {
    const response = await axios.get<string>(chapterUrl);
    const $ = cheerio.load(response.data);

    const title = $('a.chapter-title').text().trim();
    const content = htmlToPlainText($('#chapter-c').html());

    // console.log(`Start crawling chapter: ${title}`);

    if (!title || !content) return;

    const chapter = await firstValueFrom<MyChapter>(
      this.novelClient.send(
        { cmd: 'chapter.create' },
        { currentUserId, dto: { novelId: novel.id } },
      ),
    );

    await firstValueFrom<MyChapter>(
      this.novelClient.send(
        { cmd: 'chapter.update' },
        {
          chapterId: chapter.id,
          dto: { title, content, isPublished: true },
          currentUserId,
        },
      ),
    );

    console.log(`Craw chapter success: ${title} (ID: ${chapter.id})`);
  }
}
