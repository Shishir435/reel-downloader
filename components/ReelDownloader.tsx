'use client';
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChangeEvent, FormEvent, useState } from "react";

const  ReelDownloader=()=> {
  const [reelLink, setReelLink] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"Init" | "Pending" | "Done" | "Error">(
    "Init"
  );
  const createDownloadableUrl = (videoUrl: string) => {
    const blob = new Blob([videoUrl], { type: "video/mp4" });
    return URL.createObjectURL(blob);
  };
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setDownloadUrl("");
    setLoading("Pending");
    const expressBackend="https://reel-downloader.onrender.com/"
    const apiroute='/api/reel-pup'
    try {
      const response = await fetch(apiroute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reelLink }),
      });

      const data = await response.json();
      if (response.ok) {
        setLoading("Done");
        const downloadableUrl = createDownloadableUrl(data.downloadUrl);
        setDownloadUrl(downloadableUrl);
      } else {
        setLoading("Error");
        setError(data.error);
      }
    } catch (error) {
      setError("An error occurred while processing the request.");
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Card className="min-w-[400px]">
        <CardHeader>Download Instagram Reel</CardHeader>
        <CardContent className="flex flex-col gap-4 justify-center">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              value={reelLink}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setReelLink(e.target.value)
              }
              placeholder="Enter Instagram reel link"
              required
            />
            {loading !== "Done" && (
              <Button type="submit" disabled={loading === "Error"}>
                {loading === "Init" ? "Download" : loading}
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter className="w-full">
          {downloadUrl && (
            <div>
              <a
                href={downloadUrl}
                className={cn(buttonVariants({ variant: "default" }), "w-full")}
                download
              >
                Download Reel
              </a>
              <p className="max-w-[400px]">
                Your download link is ready. Please download the video within 1
                minute, as the link will expire and the video will be deleted.
              </p>
            </div>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </CardFooter>
      </Card>
    </div>
  );
}

export default ReelDownloader