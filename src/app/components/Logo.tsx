
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Sparkle } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";

import { fontVariable } from "@/data/fontdata";
interface  ChooseColorProps{
    brandName:string,
    setResponse:(response:any)=>void
}
const ChooseColorPage = ({brandName,setResponse}:ChooseColorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [fontFamily, setFontFamily] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontColor, setFontColor] = useState("#000000");
  const [generatedLogos, setGeneratedLogos] = useState("");

  const [fileName,setFileName]= useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
      setFileName(event.target.files[0].name)
    }
  };


  const handleUpload = async () => {
    if (!selectedFile) return;
  
    setIsUploading(true);
  
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
  
    reader.onloadend = async () => {
      if (!reader.result) {
        console.error("FileReader failed to read the file.");
        alert("Error reading the file. Please try again.");
        setIsUploading(false);
        return;
      }
  
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        });
  
        // Check if the response is empty or invalid
        const text = await response.text();
        console.log("Raw response:", text);
  
        if (!text) {
          throw new Error("Empty response from server");
        }
  
        const data = JSON.parse(text);
  
        if (data.url) {
          setLogoUrl(data?.url);
          setGeneratedLogos(data?.url)
       
          // setPageData((prevData) => ({
          //   ...prevData,
          //   imageUrl: data.url,  // Store uploaded URL
          // }))
        } else {
          console.error("Upload Error:", data.error);
          alert("Upload failed: " + (data.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
  
    reader.onerror = () => {
      console.error("Error reading the file.");
      alert("Error reading the file. Please try again.");
      setIsUploading(false);
    };
  };
  
  const handleGenerateLogo = async () => {
    const data = {
      brand_name: brandName,
      font_family: fontFamily,
      bg_color: bgColor,
      font_color: fontColor,
    };

    try {
      const response = await axios.post(
        "https://aibuilder-backend.whereuelevate.com/generate-logo",
        JSON.stringify(data),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);
      if (response.data?.s3_url) {
        setLogoUrl(response.data.s3_url);
        setGeneratedLogos(response.data.s3_url);
        setResponse((prev: any) => ({ ...prev, logoUrl: response.data.s3_url }));
      }
    } catch (error) {
      console.error("Error generating logo:", error);
    }
  };
  return (
    <div className="max-w-maxContent w-11/12 mx-auto flex flex-col gap-10  items-center">
        
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold">Final step: Showcase your brand mark</h1>
        <div className="flex gap-8 items-center">
          <Button
            className="bg-[#F2F2F2] text-[#333333] hover:text-[#F2F2F2]"
            onClick={() => setIsModalOpen(true)}
          >
            <Upload /> Upload Logo
          </Button>
          <Button
            className="bg-[#F2F2F2] text-[#333333] hover:text-[#F2F2F2]"
            onClick={() => setAiModalOpen(true)}
          >
            <Sparkle /> Generate Logo with AI
          </Button>
        </div>
        <p className="text-[#AAAAAA]">
          Only one logo can be used at a time—uploaded or AI-generated
        </p>
      </div>

      {logoUrl && (
        <div className="flex justify-center">
          <img src={logoUrl} alt="Uploaded Logo" className="max-h-40" />
        </div>
      )}

      

    

      {/* Dialog for file upload */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <div className="flex justify-center items-center bg-gray-100 w-full">
            <div>
              <DialogTitle className="text-xl font-semibold mb-4">
                Upload Logo
              </DialogTitle>
              <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".jpg,.png,.webp,.svg"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="block cursor-pointer text-blue-500"
                >
                  <div className="flex flex-col justify-center items-center gap-4">
                    <div className="hover:underline text-blue-800">
                      Drag your file to start uploading
                    </div>
                    <div>Or</div>
                    <div className="text-blue-800 border w-22 border-blue-800 rounded-md p-2 font-semibold">
                      Browse Files
                    </div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Only supports .jpg, .png, .webp, and .svg formats.
              </p>
              {fileName !=="" &&<div className="my-2 text-lg font-semibold">Uploaded File  {fileName}</div>}
              {generatedLogos.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Label>Generated Logos</Label>
                    <div className="flex gap-4">
                        <img
                          src={generatedLogos}
                          alt={`Generated Logo `}
                          className="max-h-20 border p-1"
                        />
                    </div>
                  </div>
                )}
              <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for AI generation */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Logo with AI</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select onValueChange={setFontFamily} defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontVariable.map((item,index)=>(
                    <SelectItem key={index} value={item}>{item.replaceAll("_", " ").replaceAll("-"," ").replaceAll(".ttf","")}</SelectItem>

                    ))}
                  </SelectContent>
                </Select>

                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-28"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Label htmlFor="fontColor">Font Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fontColor"
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                  />
                  <Input
                    type="text"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-28"
                  />
                </div>

                
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
              <Button onClick={handleGenerateLogo}>Generate</Button>
            </div>
          </Card>
          {generatedLogos.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Label>Generated Logos</Label>
                    <div className="flex gap-4">
                        <img
                          src={generatedLogos}
                          alt={`Generated Logo `}
                          className="max-h-20 border p-1"
                        />
                    </div>
                  </div>
                )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChooseColorPage;
