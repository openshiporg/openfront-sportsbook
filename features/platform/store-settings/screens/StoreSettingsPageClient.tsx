'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LOGO_ICONS, HUE_PRESETS } from '../lib/icon-registry';
import { DEFAULT_STORE_LOGO_ICON } from '../lib/store-logo';
import { updateStoreSettings } from '../actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Code } from 'lucide-react';
import { Pill, StatusDot } from '../../components/kit';
import { StoreSettingsSaveBar } from '../components/StoreSettingsSaveBar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import * as SelectPrimitive from '@radix-ui/react-select';

interface StoreSettingsPageClientProps {
  initialData: {
    id: string;
    name: string;
    logoIcon: string;
    logoColor: string;
    revision: string;
  } | null;
  initialError: string | null;
  disabledReason?: string;
}

/** Storefront price-board accent (#155eef); the hue setting rotates it with the logo. */
const BRAND_ACCENT = '#155eef';
const previewLinks = ['Sports', 'My bets', 'Promotions', 'Safer play'];

/** Live replica of the storefront header: night board, rotated accent, condensed uppercase wordmark. */
function StorefrontHeaderPreview({ name, logoIcon, logoColor }: { name: string; logoIcon: string; logoColor: string }) {
  const hue = { filter: `hue-rotate(${logoColor}deg)` };
  return (
    <figure className="min-w-0 overflow-hidden rounded-[4px] ring-1 ring-border">
      <div className="bg-[#0a0e14] text-white">
        <div className="flex min-h-16 min-w-0 items-center gap-3 px-4 py-2.5">
          <span
            style={hue}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: logoIcon }}
            className="h-7 w-6 shrink-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
          />
          <span className="min-w-0 truncate font-sb-display text-2xl font-bold uppercase leading-none tracking-wide">
            {name || 'Sportsbook'}
          </span>
          <span aria-hidden="true" className="ml-4 hidden items-center gap-1 rounded-[4px] bg-white/5 p-1 ring-1 ring-inset ring-white/10 lg:inline-flex">
            {previewLinks.map((label, index) => (
              <span key={label} className={cn('inline-flex h-8 items-center rounded-[4px] px-3 text-xs font-medium', index === 0 ? 'bg-white/10 text-white' : 'text-white/60')}>
                {label}
              </span>
            ))}
          </span>
          <span
            aria-hidden="true"
            style={{ ...hue, backgroundColor: BRAND_ACCENT }}
            className="ml-auto inline-flex h-8 shrink-0 items-center rounded-[4px] px-3 text-xs font-semibold text-white"
          >
            Sign in
          </span>
        </div>
        <div aria-hidden="true" style={{ ...hue, backgroundColor: BRAND_ACCENT }} className="h-0.5" />
      </div>
      <figcaption className="flex items-center justify-between gap-2 bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span><StatusDot tone="info" />Storefront header</span>
        <span className="tabular-nums normal-case ">hue {logoColor}°</span>
      </figcaption>
    </figure>
  );
}

export function StoreSettingsPageClient({
  initialData,
  initialError,
  disabledReason,
}: StoreSettingsPageClientProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [logoIcon, setLogoIcon] = useState(
    initialData?.logoIcon || DEFAULT_STORE_LOGO_ICON
  );
  const [logoColor, setLogoColor] = useState(
    initialData?.logoColor || '0'
  );
  const [revision, setRevision] = useState(initialData?.revision || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!initialData?.id) {
      toast.error('No storefront brand to update');
      return;
    }

    setIsLoading(true);
    const result = await updateStoreSettings(initialData.id, revision, {
      name,
      logoIcon,
      logoColor,
    });

    if (result.success) {
      if (result.data) setRevision(result.data.revision);
      toast.success('Branding saved');
    } else {
      toast.error(result.error || 'Branding not saved');
    }
    setIsLoading(false);
  };

  if (initialError) {
    return (
      <p role="alert" className="rounded-[4px] bg-red-50 px-4 py-3 text-sm text-red-900 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-200 dark:ring-red-900/50">
        <StatusDot tone="alert" />{initialError}
      </p>
    );
  }

  if (!initialData) {
    return (
      <p role="status" className="rounded-[4px] bg-muted/60 px-4 py-3 text-sm font-medium">
        <StatusDot tone="wait" />No storefront brand yet
      </p>
    );
  }

  const selectedIcon = LOGO_ICONS.find((icon) => icon.lightSvg === logoIcon);
  const disabled = isLoading || Boolean(disabledReason);

  return (
    <div className="min-w-0 space-y-5 pb-24 md:pb-0">
      <StorefrontHeaderPreview name={name} logoIcon={logoIcon} logoColor={logoColor} />

      <div className="grid min-w-0 gap-5 rounded-[4px] border bg-card p-4 text-card-foreground">
        <div className="min-w-0 space-y-5">
          <div>
            <Label htmlFor="store-name">Brand name</Label>
            <Input
              id="store-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Logo Icon Selector */}
          <div>
            <Label>Logo Icon</Label>
            <div className="mt-2 flex items-center gap-2">
              <Select
                value={selectedIcon?.id || ''}
                onValueChange={(id) => {
                  const icon = LOGO_ICONS.find((i) => i.id === id);
                  if (icon) setLogoIcon(icon.lightSvg);
                }}
              >
                <SelectPrimitive.Trigger
                  className={cn(
                    'flex h-12 w-12 shrink-0 rounded-lg border border-input bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 p-0 overflow-hidden items-center justify-center'
                  )}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: logoIcon }}
                    style={{ filter: `hue-rotate(${logoColor}deg)` }}
                    className="[&>svg]:w-6 [&>svg]:h-6"
                  />
                </SelectPrimitive.Trigger>
                <SelectContent className="border-border dark:border-blue-700">
                  {LOGO_ICONS.map((icon) => (
                    <SelectItem key={icon.id} value={icon.id}>
                      <span className="flex items-center gap-3">
                        <div
                          dangerouslySetInnerHTML={{ __html: icon.lightSvg }}
                          style={{ filter: `hue-rotate(${logoColor}deg)` }}
                          className="[&>svg]:w-6 [&>svg]:h-6"
                        />
                        <span>
                          <span className="block font-medium text-gray-900 dark:text-gray-100">
                            {icon.name}
                          </span>
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* SVG Code Editor Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 shrink-0"
                    type="button"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(500px,calc(100vw-2rem))]" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Edit SVG Code</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Edit the SVG code directly. Changes will be reflected in the icon preview.
                      </p>
                    </div>
                    <Textarea
                      value={logoIcon}
                      onChange={(e) => setLogoIcon(e.target.value)}
                      className="font-mono text-xs min-h-[300px]"
                      placeholder="<svg>...</svg>"
                    />
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">Preview:</div>
                      <div
                        dangerouslySetInnerHTML={{ __html: logoIcon }}
                        style={{ filter: `hue-rotate(${logoColor}deg)` }}
                        className="[&>svg]:w-8 [&>svg]:h-8 flex items-center justify-center p-2 border rounded"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Logo Color Selector */}
          <div>
            <Label>Logo Color</Label>
            <div className="mt-2">
              <Select
                value={logoColor}
                onValueChange={(value) => setLogoColor(value)}
              >
                <SelectPrimitive.Trigger
                  className={cn(
                    'flex h-12 w-12 shrink-0 rounded-lg border border-input bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 p-0 overflow-hidden items-center justify-center'
                  )}
                >
                  <SelectValue>
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        background: `hsl(${(240 + parseInt(logoColor)) % 360}, 70%, 50%)`
                      }}
                    />
                  </SelectValue>
                </SelectPrimitive.Trigger>
                <SelectContent className="border-border dark:border-blue-700">
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {HUE_PRESETS.map((preset) => (
                      <SelectItem
                        key={preset.value}
                        value={preset.value.toString()}
                        className="cursor-pointer p-0 h-12 w-12 flex items-center justify-center [&>span:first-child]:hidden"
                      >
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{
                            background: `hsl(${(240 + preset.value) % 360}, 70%, 50%)`
                          }}
                        />
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StoreSettingsSaveBar
          isSaving={isLoading}
          button={
            <Pill variant="primary" onClick={handleSave} disabled={disabled}>
              {isLoading ? 'Saving…' : 'Save branding'}
            </Pill>
          }
        />
        {disabledReason ? <p className="text-sm text-muted-foreground"><StatusDot tone="off" />{disabledReason}</p> : null}
      </div>
    </div>
  );
}
