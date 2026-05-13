import subprocess
import os

with open('insert_posts.sql', 'r', encoding='utf-8') as f:
    sql_statements = [line.strip() for line in f if line.strip()]

if not os.path.exists('api'):
    print("Error: 'api' directory not found.")
    exit(1)

os.chdir('api')

for i, sql in enumerate(sql_statements):
    print(f"Executing statement {i+1}/{len(sql_statements)}...")
    
    with open('temp_stmt.sql', 'w', encoding='utf-8') as tf:
        tf.write(sql)
    
    # Using shell=True for npx on Windows
    result = subprocess.run('npx wrangler d1 execute dongtan-db --file=temp_stmt.sql --remote', 
                            shell=True, capture_output=True, text=True, encoding='utf-8')
    
    if result.returncode != 0:
        print(f"Error executing statement {i+1}:")
        print(result.stderr)
    else:
        print(f"Statement {i+1} executed successfully.")

if os.path.exists('temp_stmt.sql'):
    os.remove('temp_stmt.sql')
