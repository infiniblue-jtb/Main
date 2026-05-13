const fs = require('fs');
const path = require('path');

async function uploadManualPosts() {
  const workerApiUrl = process.env.WORKER_API_URL ? process.env.WORKER_API_URL.trim() : 'https://dongtan-api.infiniblue.workers.dev';
  const apiSecret = process.env.API_SECRET ? process.env.API_SECRET.trim() : null;

  if (!apiSecret) {
    console.error('ERROR: API_SECRET environment variable is missing.');
    console.log('Usage: API_SECRET=your_secret node scripts/upload-new-posts.js');
    process.exit(1);
  }

  const postsPath = path.join(__dirname, '../src/assets/new_blog_posts.json');
  const newsArray = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

  let uploadUrl = workerApiUrl.replace(/\/$/, '');
  if (!uploadUrl.endsWith('/api/posts')) {
    uploadUrl = uploadUrl.endsWith('/api') ? `${uploadUrl}/posts` : `${uploadUrl}/api/posts`;
  }

  console.log(`Uploading ${newsArray.length} posts to ${uploadUrl}...`);

  for (const newsData of newsArray) {
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSecret}`
        },
        body: JSON.stringify(newsData)
      });

      if (response.ok) {
        console.log(`✅ Success: ${newsData.title}`);
      } else {
        console.error(`❌ Failed: ${newsData.title} (Status: ${response.status})`);
      }
    } catch (error) {
      console.error(`❌ Error uploading ${newsData.title}:`, error.message);
    }
  }
}

uploadManualPosts();
