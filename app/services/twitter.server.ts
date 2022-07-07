import type { SessionUser } from "~/models/user.server"

export async function getBookmarksByUser(userId: SessionUser['id'], accessToken: string) {
    const url = new URL(`https://api.twitter.com/2/users/${userId.replace('id#', '')}/bookmarks`)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })

    const json = await response.json()

    return json
}