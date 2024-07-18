import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer';
import {join} from 'path';
async function getCsrfTokenAndCookies() {
    const chromePath = join(process.cwd(), 'chrome', 'linux-126.0.6478.182', 'chrome-linux64', 'chrome');
    const browser = await puppeteer.launch({ 
        headless: true,
        executablePath: chromePath
        });
    const page = await browser.newPage();

    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });

    const cookies = await page.cookies();
    await browser.close();

    const csrfTokenCookie = cookies.find(cookie => cookie.name === 'csrftoken');
    const csrfToken = csrfTokenCookie ? csrfTokenCookie.value : null;

    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    return { csrfToken, cookieString };
}

export async function POST(req: NextRequest) {
    try {
        const { reelLink } = await req.json();

        const reelIdMatch = reelLink.match(/reel\/(.*?)\//);
        if (!reelIdMatch) {
            return NextResponse.json({ error: 'Invalid Instagram reel link format.' }, { status: 400 });
        }
        const reelId = reelIdMatch[1];

        const { csrfToken, cookieString } = await getCsrfTokenAndCookies();

        if (!csrfToken) {
            return NextResponse.json({ error: 'Failed to obtain CSRF token.' }, { status: 500 });
        }

        const link = 'https://www.instagram.com/graphql/query/';
        const headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36',
            'Cookie': cookieString,
            'X-CSRFToken': csrfToken,
        };
        const params = {
            hl: 'en',
            query_hash: 'b3055c01b4b222b8a47dc12b090e4e64',
            variables: `{"shortcode":"${reelId}"}`,
        };

        const response = await axios.get(link, { headers, params });
        const videoLink = response.data.data.shortcode_media.video_url;

        return NextResponse.json({ downloadUrl: videoLink });
    } catch (error) {
        console.error('Error while downloading reel:', error);
        return NextResponse.json({ error: 'Failed to process the reel link.' }, { status: 500 });
    }
}
