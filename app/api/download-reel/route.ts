import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { reelLink } = await req.json();

        const reelIdMatch = reelLink.match(/reel\/(.*?)\//);
        if (!reelIdMatch) {
            return NextResponse.json({ error: 'Invalid Instagram reel link format.' }, { status: 400 });
        }
        const reelId = reelIdMatch[1];

        const link = "https://www.instagram.com/graphql/query/";
        const headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36'
        };
        const params = {
            hl: 'en',
            query_hash: 'b3055c01b4b222b8a47dc12b090e4e64',
            variables: `{"child_comment_count":3,"fetch_comment_count":40,"has_threaded_comments":true,"parent_comment_count":24,"shortcode":"${reelId}"}`
        };

        const response = await axios.get(link, { headers, params });
        const videoLink = response.data.data.shortcode_media.video_url;
        

        return NextResponse.json({ downloadUrl: videoLink });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to process the reel link.' }, { status: 500 });
    }
}
