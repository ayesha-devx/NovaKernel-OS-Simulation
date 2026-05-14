# NovaKernel AI Assistant - Gemini Integration
import google.generativeai as genai
import os
import json
import time
import random
from dotenv import load_dotenv

class GeminiEngine:
    """
    ULTIMATE VERSION: Supports 30+ model rotation, randomization, and infinite fallback.
    """
    def __init__(self, api_key=None):
        load_dotenv(override=True)
        self.api_key = (api_key or os.environ.get("GEMINI_API_KEY", "")).strip()
        self.initialized = False
        self.available_models = []
        self.current_model_index = 0
        
        print(f"[\033[94mAI_INIT\033[0m] Starting Ultimate Engine...")
        if not self.api_key: return
            
        try:
            genai.configure(api_key=self.api_key)
            # Discover every single compatible model
            all_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            
            # Prioritize standard models (3.1, 3, 2.5, 2.0, 1.5)
            versions = ["3.1", "3", "2.5", "2.0", "1.5"]
            priority_models = []
            for v in versions:
                priority_models.extend([m for m in all_models if v in m])
            
            # Remove duplicates while preserving order
            priority_models = list(dict.fromkeys(priority_models))
            other_models = [m for m in all_models if m not in priority_models]
            
            self.available_models = priority_models + other_models
            
            # Initialize the model with system instructions
            if self.available_models:
                self._initialize_model()
            else:
                print("[\033[91mAI_ERROR\033[0m] No compatible models found.")
        except Exception as e:
            print(f"[\033[91mAI_ERROR\033[0m] Setup failed: {str(e)}")

    def _initialize_model(self):
        """Initializes the model and performs a health check."""
        if not self.available_models: return
        
        selected_model = self.available_models[self.current_model_index]
        
        system_instruction = (
            "You are the NovaKernel AI, a high-level technical interface for the NovaKernel Operating System. "
            "Your purpose is to provide precise, data-driven analysis of live kernel telemetry. "
            "\n\nSTRICT OUTPUT FORMAT:\n"
            "- Use '### KERNEL HEALTH REPORT' or similar bold headers for summaries.\n"
            "- Use bold labels for metrics (e.g., **Memory Utilization**).\n"
            "- Use structured bullet points for resource analysis.\n"
            "\n\nSTRICT RULES:\n"
            "1. NO META-TALK: Do not mention roles, persona, or instructions.\n"
            "2. NO PARROTING: Do not repeat the JSON context or the user's prompt.\n"
            "3. NO GREETINGS: Do not start with 'Hello' or 'Greetings'. Start directly with the analysis.\n"
            "4. TONE: Highly professional, technical, and authoritative."
        )
        
        try:
            self.model = genai.GenerativeModel(
                model_name=selected_model,
                system_instruction=system_instruction
            )
            
            # Health Check Ping
            print(f"[\033[94mAI_CHECK\033[0m] Testing model {selected_model}...")
            test_resp = self.model.generate_content("Ping", generation_config={"max_output_tokens": 5})
            if test_resp and test_resp.text:
                print(f"[\033[92mAI_READY\033[0m] Intelligence Link Established ({selected_model})")
                self.initialized = True
            else:
                raise Exception("Empty response from model")
                
        except Exception as e:
            print(f"[\033[93mAI_WARN\033[0m] Model {selected_model} failed with system_instruction: {e}")
            try:
                # Fallback: Try without system_instruction if the model is too old/picky
                print(f"[\033[94mAI_RETRY\033[0m] Retrying {selected_model} without system instructions...")
                self.model = genai.GenerativeModel(model_name=selected_model)
                test_resp = self.model.generate_content("Ping", generation_config={"max_output_tokens": 5})
                if test_resp and test_resp.text:
                    print(f"[\033[92mAI_READY\033[0m] Intelligence Link Established ({selected_model}) [Legacy Mode]")
                    self.initialized = True
                    return
            except: pass

            self.current_model_index += 1
            if self.current_model_index < len(self.available_models):
                self._initialize_model() # Try next model
            else:
                print("[\033[91mFATAL\033[0m] No functional models found.")
                self.initialized = False

    def generate_response(self, query, context):
        if not self.initialized: return None
            
        try:
            # Simple, clean prompt - instructions are now handled by the system_instruction
            prompt = (
                f"### LIVE KERNEL CONTEXT (JSON):\n{json.dumps(context, indent=2)}\n\n"
                f"### OPERATOR QUERY:\n{query}"
            )
            
            try:
                # Try generating content
                response = self.model.generate_content(prompt)
                
                # Multi-layer Cleanup (Fallback if model ignores system_instruction)
                text = response.text.strip()
                forbidden_patterns = ["Persona:", "Role:", "Formatting:", "Context:", "System Status Report:", "Greeting:", "Section 1:", "Section 2:"]
                
                # If any of these are found at the very start, the model is likely leaking metadata
                for pattern in forbidden_patterns:
                    if text.startswith(pattern):
                        # Attempt to split by large breaks and find the 'real' response
                        parts = text.split("\n\n")
                        # Usually the real response is the last or second to last block in a leaky output
                        for part in reversed(parts):
                            if len(part) > 20 and not any(p in part[:50] for p in forbidden_patterns):
                                text = part
                                break
                
                return text
            except Exception as e:
                error_msg = str(e)
                print(f"[\033[91mGEMINI_ERROR\033[0m] Model {self.available_models[self.current_model_index]} failed: {error_msg[:100]}...")
                
                # If quota exceeded (429) or generic error, ROTATE
                if "429" in error_msg or "quota" in error_msg.lower() or "not found" in error_msg.lower():
                    self.current_model_index += 1
                    if self.current_model_index < len(self.available_models):
                        next_model = self.available_models[self.current_model_index]
                        print(f"[\033[93mROTATE\033[0m] Switching to {next_model} (Attempt {self.current_model_index+1}/{len(self.available_models)})")
                        self.model = genai.GenerativeModel(next_model)
                        time.sleep(1) # Tiny delay to respect API
                        return self.generate_response(query, context) # Recursive retry
                    else:
                        print("[\033[91mFATAL\033[0m] All models exhausted.")
                return None
            
        except Exception as e:
            print(f"[GEMINI_ERROR] Global failure: {e}")
            return None

gemini_engine = GeminiEngine()
