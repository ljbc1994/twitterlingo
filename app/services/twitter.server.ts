import type { SessionUser } from "~/models/user.server"

interface TwitterBookmark {
  id: string;
  lang: string;
  text: string;
}

interface TwitterBookmarkResponse {
  data: TwitterBookmark[];
  result_count: number;
}

export async function getBookmarksByUser(userId: SessionUser['id'], accessToken: string): Promise<TwitterBookmarkResponse> {
    const url = new URL(`https://api.twitter.com/2/users/${userId.replace('id#', '')}/bookmarks?tweet.fields=lang&user.fields=profile_image_url,name`)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })

    const json: TwitterBookmarkResponse = await response.json()

    return json
}