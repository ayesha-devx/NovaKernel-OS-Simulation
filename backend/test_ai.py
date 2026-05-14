import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)
key = os.environ.get("GEMINI_API_KEY", "").strip()

print(f"--- NovaKernel AI Discovery Tool ---")
if not key:
    print("ERROR: No API Key found in .env")
    exit()

try:
    genai.configure(api_key=key)
    
    print("Listing all models supported by your API Key:")
    available = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" - ✅ {m.name}")
            available.append(m.name)
        else:
            print(f" - ❌ {m.name} (No Content Support)")
            
    if not available:
        print("\n❌ NO COMPATIBLE MODELS FOUND. Your key might be restricted.")
        exit()
        
    selected = available[0]
    print(f"\nAttempting test with: {selected}...")
    model = genai.GenerativeModel(selected)
    response = model.generate_content("Ping")
    print(f"SUCCESS! Response: {response.text[:20]}...")
    print(f"\n✅ THE FIX: Use model '{selected}' in the main code.")

except Exception as e:
    print(f"\n❌ DISCOVERY FAILED: {str(e)}")
