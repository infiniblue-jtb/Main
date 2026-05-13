import json

all_posts = []

# Load FF1
with open('ff1_post.json', 'r', encoding='utf-8') as f:
    all_posts.append(json.load(f))

# Load Batches
for i in range(1, 4):
    with open(f'ff_posts_batch{i}.json', 'r', encoding='utf-8') as f:
        all_posts.extend(json.load(f))

sql_statements = ["DELETE FROM posts;"]
for p in all_posts:
    title = p['title'].replace("'", "''")
    content = p['content'].replace("'", "''")
    excerpt = p['excerpt'].replace("'", "''")
    image_url = p['image_url'].replace("'", "''")
    
    sql = f"INSERT INTO posts (title, content, excerpt, image_url) VALUES ('{title}', '{content}', '{excerpt}', '{image_url}');"
    sql_statements.append(sql)

with open('insert_posts.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated insert_posts.sql with {len(sql_statements)} statements.")
