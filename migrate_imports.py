import os

def replace_in_files(directory, search_text, replace_text):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".jsx"):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if search_text in content:
                    new_content = content.replace(search_text, replace_text)
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {path}")

if __name__ == "__main__":
    replace_in_files("frontend/src", "context/ProcessContext", "context/KernelContext")
