/**
 * NovaKernel OS Simulator - Hardware Abstraction Layer Firmware
 * Version: 1.0.0
 * 
 * Hardware Protocol:
 * P1_READY, P1_RUNNING, P1_WAIT, P1_DONE
 * P2_READY, P2_RUNNING, P2_WAIT, P2_DONE
 * P3_READY, P3_RUNNING, P3_WAIT, P3_DONE
 * DEADLOCK, RESET_ALL, DEMO
 */

// --- PIN MAPPING ---
// Process 1
const int P1_READY_PIN = 2;
const int P1_RUNNING_PIN = 3;
const int P1_WAITING_PIN = 4;

// Process 2
const int P2_READY_PIN = 5;
const int P2_RUNNING_PIN = 6;
const int P2_WAITING_PIN = 7;

// Process 3
const int P3_READY_PIN = 8;
const int P3_RUNNING_PIN = 9;
const int P3_WAITING_PIN = 10;

// Global
const int DEADLOCK_PIN = 11;
const int TERM_PIN = 12;
const int BUZZER_PIN = 13;

String inputBuffer = "";

void setup() {
  Serial.begin(9600);
  
  // Initialize Pins
  for(int i=2; i<=13; i++) {
    pinMode(i, OUTPUT);
    digitalWrite(i, LOW);
  }
  
  startupAnimation();
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (inputBuffer.length() > 0) {
        processCommand(inputBuffer);
        inputBuffer = "";
      }
    } else {
      inputBuffer += c;
    }
  }
}

void processCommand(String cmd) {
  cmd.trim();
  
  // Global Commands
  if (cmd == "RESET_ALL") {
    resetAll();
    return;
  }
  
  if (cmd == "DEADLOCK") {
    deadlockSequence();
    return;
  }
  
  if (cmd == "DEMO") {
    startupAnimation();
    return;
  }

  // Process Commands (P1_READY, etc.)
  if (cmd.startsWith("P")) {
    int slot = cmd.substring(1, 2).toInt();
    String state = cmd.substring(3);
    
    updateSlot(slot, state);
  }
}

void updateSlot(int slot, String state) {
  int r, g, y;
  
  if (slot == 1) { r = P1_READY_PIN; g = P1_RUNNING_PIN; y = P1_WAITING_PIN; }
  else if (slot == 2) { r = P2_READY_PIN; g = P2_RUNNING_PIN; y = P2_WAITING_PIN; }
  else if (slot == 3) { r = P3_READY_PIN; g = P3_RUNNING_PIN; y = P3_WAITING_PIN; }
  else return;

  // Clear slot first
  digitalWrite(r, LOW); digitalWrite(g, LOW); digitalWrite(y, LOW);

  if (state == "READY") digitalWrite(r, HIGH);
  else if (state == "RUNNING") digitalWrite(g, HIGH);
  else if (state == "WAIT") digitalWrite(y, HIGH);
  else if (state == "DONE") {
    // Flash termination LED
    digitalWrite(TERM_PIN, HIGH);
    delay(200);
    digitalWrite(TERM_PIN, LOW);
  }
}

void resetAll() {
  for(int i=2; i<=13; i++) digitalWrite(i, LOW);
  noTone(BUZZER_PIN);
}

void deadlockSequence() {
  digitalWrite(DEADLOCK_PIN, HIGH);
  tone(BUZZER_PIN, 1000);
  delay(1000);
  digitalWrite(DEADLOCK_PIN, LOW);
  noTone(BUZZER_PIN);
}

void startupAnimation() {
  for(int i=2; i<=13; i++) {
    digitalWrite(i, HIGH);
    delay(50);
  }
  delay(200);
  for(int i=13; i>=2; i--) {
    digitalWrite(i, LOW);
    delay(50);
  }
}
