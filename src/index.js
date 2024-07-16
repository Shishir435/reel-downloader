import express from 'express'
import axios from 'axios'
import cors from 'cors'
const app=express()
app.use(cors())
app.use(express.json())
const PORT=process.env.PORT||10000
app.get('/',(req,res)=>{
res.send("hello ji")
})
app.post("/",async (req,res)=>{
    try {
        const { reelLink } = await req.body
        const reelIdMatch = reelLink.match(/reel\/(.*?)\//);
        if (!reelIdMatch) {
            return res.status(400).json({ error: 'Invalid Instagram reel link format.' });
        }
        const reelId = reelIdMatch[1];

        const link = "https://www.instagram.com/graphql/query/";
        const headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36',
        };
        const params = {
            hl: 'en',
            query_hash: 'b3055c01b4b222b8a47dc12b090e4e64',
            variables: `{"shortcode":"${reelId}"}`
        };
        

        const response = await axios.get(link, { headers, params });
        const videoLink = response.data.data.shortcode_media.video_url;
        

        return res.json({ downloadUrl: videoLink });
    } catch (error) {
        console.error("error while downloading reel",error);
        return res.status(500).json({ error: 'Failed to process the reel link.'});
    }
})

app.listen(PORT,()=>{
    console.log(`app is running on http://localhost:${PORT}`)
})