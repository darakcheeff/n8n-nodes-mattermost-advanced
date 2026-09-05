# n8n-nodes-mattermost-advanced

![Mattermost](nodes/MattermostAdvanced/mattermost.svg)

An advanced, feature-complete community node for **[Mattermost](https://mattermost.com/)** in **[n8n](https://n8n.io/)**.

Unlike the built-in n8n Mattermost node (which only supports basic message posting and lacks post updates, get-by-id, file uploads, direct messages, and thread replies), **`n8n-nodes-mattermost-advanced`** unlocks the full power of Mattermost REST API v4 without requiring custom `HTTP Request` workarounds or sub-workflows.

---

## Features

### 📨 1. Messages (`message`)
- **Update / Edit Post (`PUT /posts/{post_id}`)**: Modify message text, append release tables, update status bars, or update attachments in-place.
- **Get Post by ID (`GET /posts/{post_id}`)**: Retrieve existing post content and metadata before editing.
- **Post Message / Thread Reply**: Send Markdown messages to any channel or reply to a thread using `Thread Root Post ID`.
- **Dynamic Attachments & Interactive Buttons (Raw JSON)**: Pass arrays of interactive buttons, actions, and menus directly from an upstream Code node without awkward multi-level form builders.
- **Attach Files**: Pass comma-separated `file_ids` directly into the post.
- **Get Post Thread (`GET /posts/{post_id}/thread`)**: Retrieve complete conversation threads.
- **Post Ephemeral Message (`POST /posts/ephemeral`)**: Send messages visible only to a specific user.
- **Search Posts (`POST /posts/search`)**: Search messages across channels with search syntax.
- **Pin / Unpin Posts**: Pin important announcements or unpin completed tasks.
- **Delete Post**.

### 📁 2. Files & Media (`file`)
- **Upload File (`POST /files`)**: Upload images (posters), documents, `.torrent` files, or logs directly from n8n binary data into a channel. Returns `file_id` for immediate attachment to messages.
- **Get File Info**: Retrieve file metadata, mime type, and dimensions.
- **Download File**: Download attachments from Mattermost into n8n binary items.

### 💬 3. Channels & Direct Messages (`channel`)
- **Create Direct Message Channel (`POST /channels/direct`)**: Create or fetch a direct message channel between your bot and any user ID to send private messages.
- **Update Channel Header & Purpose**: Update status banners and descriptions in channel headers.
- **Get Channel Details**: Retrieve channel metadata.
- **Channel Members**: List members and add users to channels.
- **Search Channels**.

### 👍 4. Reactions (`reaction`)
- **Add Emoji Reaction** (e.g. `+1`, `white_check_mark`, `fire`).
- **Remove Reaction**.
- **Get Reactions for Post**.

### 👤 5. Users & Status (`user`)
- **Get Me**: Retrieve authenticated user / bot info.
- **Get User by ID / Username**.
- **Set Custom Status (`PUT /users/{id}/status/custom`)**: Set custom emoji status and text (e.g. 🤖 `Processing torrents...`).

---

## Installation

### In n8n (Community Nodes)
1. Go to **Settings** > **Community Nodes** in your n8n instance.
2. Select **Install**.
3. Enter `n8n-nodes-mattermost-advanced`.
4. Agree to the risks and install.

---

## Credentials

The node supports both:
1. **Mattermost Advanced API** (`mattermostAdvancedApi`):
   - **Base URL**: e.g. `https://mattermost.example.com` or `https://mm.ansy.us`
   - **Access Token / Bot Token**: Personal Access Token or Bot Token
2. **Standard Mattermost API** (`mattermostApi`):
   - Seamlessly uses existing Mattermost credentials already configured in your n8n workspace.

---

## Example: Interactive Buttons in Workflows

In a `Code` node:
```javascript
return {
  json: {
    message_text: "| № | Title | Size |\n| :-: | :--- | :---: |\n| 1 | Movie 1080p | 2.1 GB |",
    attachments: [
      {
        text: "Select a release to download:",
        actions: [
          {
            name: "№1 Download [2.1 GB]",
            integration: {
              url: "https://n8n.example.com/webhook/download",
              context: { torrent_id: "12345" }
            }
          }
        ]
      }
    ]
  }
};
```

In `Mattermost Advanced` node:
- Resource: **Message**
- Operation: **Update / Edit**
- Post ID: `={{ $('Trigger').first().json.post_id }}`
- Message: `={{ $json.message_text }}`
- Attachments Mode: **Raw JSON / Code (Buttons & Menus)**
- Attachments JSON: `={{ JSON.stringify($json.attachments) }}`

---

## License

[MIT](LICENSE)
