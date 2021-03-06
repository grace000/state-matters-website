const router = require("express").Router()
const contentful = require("contentful")
const { normalize, schema } = require("normalizr")

const config =
  process.env.NODE_ENV === "production"
    ? {
        space: "021ulla0m5co",
        accessToken: process.env.PROD_API_KEY
      }
    : {
        space: "021ulla0m5co",
        accessToken: process.env.DEV_API_KEY,
        host: "preview.contentful.com"
      }

const client = contentful.createClient(config)

router
  .get("/", async (req, res) => {
    try {
      const { items } = await client.getEntries({
        content_type: "article",
        select: "sys.id,fields.title,fields.contributor,fields.photo"
      })
      const articleSchema = new schema.Entity("articles", undefined, {
        idAttribute: lesson => lesson.sys.id
      })
      const articleListSchema = new schema.Array(articleSchema)
      const {
        entities: { articles }
      } = normalize(items, articleListSchema)
      res.json(articles)
    } catch (error) {
      res.status(500)
      res.json(error)
    }
  })
  .get("/:article_id", async (req, res) => {
    if (!req.params.article_id)
      return res.status(400).json({ message: "no id attached" })
    try {
      const { items } = await client.getEntries({
        "sys.id": req.params.article_id
      })
      res.status(200).json(items[0])
    } catch (error) {
      res.status(400).json(error)
    }
  })

module.exports = router
