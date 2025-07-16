import express from "express"
import { ENV } from "./config/env.js";
import { favoritesTable } from "./db/schema.js";
import { db } from "./config/db.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";

const app = express()
app.use(express.json())
if (ENV.NODE_ENV === "production") job.start();
const PORT = ENV.PORT || 5001;

app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true });
})
app.post("/api/favorites", async (req, res) => {
    try {
        const { userId, recipeId, title, image, cookTime, servings } = req.body;

        if (!userId || !recipeId || !title) {
            return res.status(400).json({ error: "Missing Required Values" })
        }
        const newFavorite = await db
            .insert(favoritesTable)
            .values({
                userId,
                recipeId,
                title,
                image,
                cookTime,
                servings,
            })
            .returning();
        console.log("added")
        res.status(500).json(newFavorite[0])
    }
    catch (error) {
        console.log("Error in adding Favorites:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
})

app.get("/api/favorites/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const userFavorties = await db.select().from(favoritesTable).where(
            eq(favoritesTable.userId, userId)
        )
        res.status(200).json(userFavorties)

    }
    catch (error) {
        console.log("Error in fetching favorite", error);
        res.status(500).json({ error: "Something went wrong" });
    }

})

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
    try {
        const { userId, recipeId } = req.params;
        await db
            .delete(favoritesTable)
            .where(
                and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
            );

        res.status(200).json({ message: "Favorties Deleted Successfully" })
    }
    catch (error) {
        console.log("Error removing a favorite", error);
        res.status(500).json({ error: "Something went wrong" });
    }
})




app.listen(PORT, () => {
    console.log("server runing", PORT);
})