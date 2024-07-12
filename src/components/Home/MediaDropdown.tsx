import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ImageIcon, Plus, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import ReactPlayer from 'react-player';

const MediaDropdown = () => {
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSlectedVideo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <input
        type="file"
        ref={imageInput}
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target?.files![0])}
        hidden
      />

      <input
        type="file"
        ref={videoInput}
        accept="video/*"
        onChange={(e) => setSlectedVideo(e.target?.files![0])}
        hidden
      />
      {selectedImage && (
        <MediaImageDialog
          isOpen={selectedImage !== null}
          onClose={() => setSelectedImage(null)}
          selectedImage={selectedImage}
          isLoading={isLoading}
        />
      )}

      {selectedVideo && (
        <MediaVideoDialog 
          isOpen={selectedVideo !== null}
            onClose={() => setSlectedVideo(null)}
            selectedVideo={selectedVideo}
            isLoading={isLoading}  
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Plus
            className="text-gray-600 dark:text-gray-400"
            style={{ cursor: "pointer" }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => imageInput.current!.click()}>
            <ImageIcon size={18} className="mr-1" /> Photo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => videoInput.current!.click()}>
            <Video size={20} className="mr-1" /> Video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default MediaDropdown;

type MediaImageDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: File | null;
  isLoading: boolean;
};

const MediaImageDialog = ({
  isOpen,
  onClose,
  selectedImage,
  isLoading,
}: MediaImageDialogProps) => {
  const [renderedImage, setRenderedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedImage) return;
    const reader = new FileReader();
    reader.onload = (e) => setRenderedImage(e.target?.result as string);
    reader.readAsDataURL(selectedImage);
  }, [selectedImage]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogDescription className="flex flex-col gap-10 justify-center items-center">
          {renderedImage && (
            <Image
              src={renderedImage}
              width={300}
              height={300}
              alt="selected image"
            />
          )}
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

type MediaVideoDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedVideo: File;
	isLoading: boolean;
	
};

const MediaVideoDialog = ({ isOpen, onClose, selectedVideo, isLoading }: MediaVideoDialogProps) => {
	const renderedVideo = URL.createObjectURL(new Blob([selectedVideo], { type: "video/*" }));

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
		>
			<DialogContent>
				<DialogDescription>Video</DialogDescription>
				<div className='w-full'>
					{renderedVideo && <ReactPlayer url={renderedVideo} controls width='100%' />}
				</div>
				<Button className='w-full bg-green-primary' disabled={isLoading} >
					{isLoading ? "Sending..." : "Send"}
				</Button>
			</DialogContent>
		</Dialog>
	);
};