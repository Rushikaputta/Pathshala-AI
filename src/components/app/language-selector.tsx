"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LanguageSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function LanguageSelector({
  value,
  onValueChange,
}: LanguageSelectorProps) {
  return (
    <div className="grid gap-2 text-left">
      <Label htmlFor="language-select">Select Language</Label>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger id="language-select" className="w-full">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="as">অসমীয়া</SelectItem>
          <SelectItem value="bn">বাংলা</SelectItem>
          <SelectItem value="gu">ગુજરાતી</SelectItem>
          <SelectItem value="hi">हिन्दी</SelectItem>
          <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
          <SelectItem value="ml">മലയാളം</SelectItem>
          <SelectItem value="mr">मराठी</SelectItem>
          <SelectItem value="or">ଓଡ଼ିଆ</SelectItem>
          <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
          <SelectItem value="ta">தமிழ்</SelectItem>
          <SelectItem value="te">తెలుగు</SelectItem>
          <SelectItem value="ur">اردو</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
