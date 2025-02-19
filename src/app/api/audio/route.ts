import { NextRequest, NextResponse } from "next/server";
import { Polly, SynthesizeSpeechCommand, OutputFormat, VoiceId } from "@aws-sdk/client-polly";
import { Readable } from "stream";

// Initialize Polly client using AWS SDK v3
const polly = new Polly({
  region: "ap-south-1", // Change to your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ message: "Text is required" }, { status: 400 });
    }

    const params = {
      Text: text,
      OutputFormat: OutputFormat.MP3, // Use OutputFormat.MP3 instead of a string
      VoiceId: "Joanna" as VoiceId, // You can change this to any available voice in AWS Polly
    };

    // Requesting speech synthesis from AWS Polly (AWS SDK v3 way)
    const command = new SynthesizeSpeechCommand(params);
    const response = await polly.send(command);

    if (!response.AudioStream) {
      return NextResponse.json({ message: "Failed to generate audio" }, { status: 500 });
    }

    // Convert AWS Polly AudioStream to Buffer
    const audioBuffer = await streamToBuffer(response.AudioStream as Readable);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {

    return NextResponse.json({ status: 500 });
  }
}

// Helper function to convert AWS Polly stream to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
