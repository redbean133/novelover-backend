-- Assign random avatar URLs to users without one
-- The URLs are taken from a predefined list of avatar images

UPDATE "user"
SET avatar_url = (
  (
    ARRAY[
      'https://res.cloudinary.com/dlmrbvtbp/image/upload/v1760412379/9_gf6qce.jpg',
      'https://res.cloudinary.com/dlmrbvtbp/image/upload/v1760412379/5_tpttuz.jpg',
      'https://res.cloudinary.com/dlmrbvtbp/image/upload/v1760412378/1_ggvdqs.jpg',
      'https://res.cloudinary.com/dlmrbvtbp/image/upload/v1760412378/13_ymaqbi.jpg',
      'https://res.cloudinary.com/dlmrbvtbp/image/upload/v1760412378/16_hun2lo.jpg',
      'https://res.cloudinary.com/dlmrbvtbp/image/upload/v1760412378/11_tittlt.jpg',
      'https://res.cloudinary.com/dlmrbvtbp/image/upload/v1760412378/15_tsfsfr.jpg',
      'https://res.cloudinary.com/dlmrbvtbp/image/upload/v1760412377/14_xqq75r.jpg'
    ]
  )[ceil(random() * 8)]
)
WHERE avatar_url IS NULL;