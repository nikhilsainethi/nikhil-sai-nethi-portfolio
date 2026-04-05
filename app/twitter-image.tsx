import {
  createSocialImage,
  socialImageContentType,
  socialImageSize,
} from "@/lib/social-image";

export const alt = "Social preview for Nikhil Sai Nethi";
export const size = socialImageSize;
export const contentType = socialImageContentType;
export const dynamic = "force-static";

export default function Image() {
  return createSocialImage("Engineering Log");
}
