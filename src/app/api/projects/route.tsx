import { NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET() {
    try {
        const GithubToken = process.env.GITHUB_PERSON_API_KEY;
        const username = process.env.GITHUB_USERNAME;

        const octokit = new Octokit({ auth: GithubToken });
        const res = await octokit.request(`GET /users/${username}/repos`)
            .then(async (response) => {
                let data = response.data;

                const languagePromises = data.map(async (project: any, index: number) => {
                    try {
                        const languagesResponse = await octokit.request(`GET ${project.languages_url}`);
                        const languagesData = languagesResponse.data;
                        const languages = Object.keys(languagesData);
                        data[index].languages = languages;
                    } catch {
                        data[index].languages = [];
                    }
                });

                await Promise.all(languagePromises);
                return data;
            })
            .catch(() => {
                return false;
            });

        if (!res) {
            return NextResponse.json(
                { message: 'Failed to fetch user data' },
                { status: 500, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        return NextResponse.json(res, {
            status: 200,
            headers: { 'Cache-Control': 'no-store' }
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { message: 'Failed to fetch user data' },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
