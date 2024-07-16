// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import * as fs from 'fs';
// import * as os from 'os';
// import * as path from 'path';

// const downloadReel = async (videoLink: string, reelId: string): Promise<string> => {
//     const headers = {
//         'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36'
//     };

//     try {
//         const response = await axios.get(videoLink, { headers, responseType: 'arraybuffer' });
//         const tempDir = os.tmpdir();
//         const filePath = path.join(tempDir, `${reelId}.mp4`);
//         fs.writeFileSync(filePath, response.data);
//         return filePath;
//     } catch (error) {
//         throw new Error(`Failed to download ${videoLink}: ${error}`);
//     }
// };

// export async function POST(req: NextRequest) {
//     try {
//         const { reelLink } = await req.json();

//         const reelIdMatch = reelLink.match(/reel\/(.*?)\//);
//         if (!reelIdMatch) {
//             return NextResponse.json({ error: 'Invalid Instagram reel link format.' }, { status: 400 });
//         }
//         const reelId = reelIdMatch[1];

//         const link = "https://www.instagram.com/graphql/query/";
//         const headers = {
//             'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36'
//         };
//         const params = {
//             hl: 'en',
//             query_hash: 'b3055c01b4b222b8a47dc12b090e4e64',
//             variables: `{"child_comment_count":3,"fetch_comment_count":40,"has_threaded_comments":true,"parent_comment_count":24,"shortcode":"${reelId}"}`
//         };

//         const response = await axios.get(link, { headers, params });
//         const videoLink = response.data.data.shortcode_media.video_url;
//         const filePath = await downloadReel(videoLink, reelId);

//         // Set a timeout to delete the file after 1 minute
//         setTimeout(() => {
//             fs.unlink(filePath, (err) => {
//                 if (err) console.error(`Failed to delete file: ${filePath}`, err);
//                 else console.log(`File deleted: ${filePath}`);
//             });
//         }, 60000); // 1 minute

//         return NextResponse.json({ downloadUrl: `/api/download-reel/file?id=${reelId}` });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: 'Failed to process the reel link.' }, { status: 500 });
//     }
// }

// export async function GET(req: NextRequest) {
//     const { searchParams } = new URL(req.url);
//     const reelId = searchParams.get('id');

//     if (!reelId) {
//         return NextResponse.json({ error: 'Missing reel ID' }, { status: 400 });
//     }

//     const tempDir = os.tmpdir();
//     const filePath = path.join(tempDir, `${reelId}.mp4`);

//     if (!fs.existsSync(filePath)) {
//         return NextResponse.json({ error: 'File not found' }, { status: 404 });
//     }

//     const fileBuffer = fs.readFileSync(filePath);
//     return new NextResponse(fileBuffer, {
//         headers: {
//             'Content-Type': 'video/mp4',
//             'Content-Disposition': `attachment; filename="${reelId}.mp4"`,
//         },
//     });
// }

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const downloadReel = async (videoLink: string, reelId: string): Promise<string> => {
    const headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36'
    };

    try {
        const response = await axios.get(videoLink, { headers, responseType: 'arraybuffer' });
        const tempDir = os.tmpdir();
        const filePath = path.join(tempDir, `${reelId}.mp4`);
        fs.writeFileSync(filePath, response.data);
        return filePath;
    } catch (error) {
        throw new Error(`Failed to download ${videoLink}: ${error}`);
    }
};

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
        const filePath = await downloadReel(videoLink, reelId);

        // Set a timeout to delete the file after 1 minute
        setTimeout(() => {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Failed to delete file: ${filePath}`, err);
                else console.log(`File deleted: ${filePath}`);
            });
        }, 60000); // 1 minute

        return NextResponse.json({ downloadUrl: `/api/download-reel?id=${reelId}` });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to process the reel link.' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const reelId = searchParams.get('id');

    if (!reelId) {
        return NextResponse.json({ error: 'Missing reel ID' }, { status: 400 });
    }

    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, `${reelId}.mp4`);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename="${reelId}.mp4"`,
        },
    });
}
