import dotenv from "dotenv";
import { db } from "../db";
import { voices } from "../../shared/schema";
import type { InsertVoice } from "../../shared/schema";

dotenv.config();

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: {
    [key: string]: string;
  };
}

async function syncVoices() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY is not set in environment variables');
    process.exit(1);
  }

  try {
    console.log('Fetching voices from ElevenLabs API...');
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const voicesList: ElevenLabsVoice[] = data.voices || [];
    
    console.log(`Found ${voicesList.length} voices`);
    
    // Clear existing voices
    console.log('Clearing existing voices...');
    await db.delete(voices);

    // Insert new voices
    const insertedVoices: InsertVoice[] = [];
    
    for (const voice of voicesList) {
      try {
        const newVoice: InsertVoice = {
          voiceId: voice.voice_id,
          name: voice.name,
          category: voice.labels?.category || null,
          // createdAt will be set by the database default
        };

        await db.insert(voices).values(newVoice);
        insertedVoices.push(newVoice);
        console.log(`Added voice: ${voice.name} (${voice.voice_id})`);
      } catch (error) {
        console.error(`Error inserting voice ${voice.voice_id}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`Successfully synced ${insertedVoices.length} voices`);
    process.exit(0);
  } catch (error) {
    console.error('Error syncing voices:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the sync
syncVoices();
