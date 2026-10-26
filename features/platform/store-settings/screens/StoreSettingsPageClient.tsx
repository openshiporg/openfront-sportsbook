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
import { Pill, StatusDot, Track } from '../../components/kit';

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
    <div className="min-w-0 space-y-5">
      <StorefrontHeaderPreview name={name} logoIcon={logoIcon} logoColor={logoColor} />

      <div className="grid min-w-0 gap-5 rounded-[4px] border bg-card p-4 text-card-foreground lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
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

          <div>
            <p className="text-sm font-medium leading-none">Accent hue</p>
            <Track label="Accent hue" className="mt-2">
              {HUE_PRESETS.map((preset) => {
                const value = preset.value.toString();
                return (
                  <Pill
                    key={preset.value}
                    size="sm"
                    variant="flat"
                    aria-pressed={logoColor === value}
                    aria-label={preset.name}
                    title={preset.name}
                    onClick={() => setLogoColor(value)}
                    className="w-8 px-0"
                  >
                    <span
                      aria-hidden="true"
                      className="size-4 rounded-[4px] ring-1 ring-black/10"
                      style={{ backgroundColor: BRAND_ACCENT, filter: `hue-rotate(${preset.value}deg)` }}
                    />
                  </Pill>
                );
              })}
            </Track>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Label id="logo-icon-label">Logo</Label>
            <span className="truncate tabular-nums text-xs text-muted-foreground">{selectedIcon?.name ?? 'Custom SVG'}</span>
          </div>
          <div role="radiogroup" aria-labelledby="logo-icon-label" className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8">
            {LOGO_ICONS.map((icon) => {
              const active = selectedIcon?.id === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={icon.name}
                  title={icon.name}
                  onClick={() => setLogoIcon(icon.lightSvg)}
                  className={cn(
                    'grid aspect-square min-w-0 place-items-center rounded-[4px] bg-muted/60 ring-1 ring-inset ring-transparent transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active && 'bg-background ring-foreground/70 dark:bg-zinc-800'
                  )}
                >
                  <span
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: icon.lightSvg }}
                    style={{ filter: `hue-rotate(${logoColor}deg)` }}
                    className="h-6 w-6 [&>svg]:h-full [&>svg]:w-full"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Track>
          <Pill variant="primary" onClick={handleSave} disabled={disabled}>
            {isLoading ? 'Saving…' : 'Save branding'}
          </Pill>
          <Popover>
            <PopoverTrigger asChild>
              <Pill aria-label="Edit SVG code">
                <Code aria-hidden="true" />SVG
              </Pill>
            </PopoverTrigger>
            <PopoverContent className="w-[min(500px,calc(100vw-2rem))]" align="start">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Logo SVG</h4>
                <Textarea
                  value={logoIcon}
                  onChange={(e) => setLogoIcon(e.target.value)}
                  className="min-h-[300px] tabular-nums text-xs"
                  placeholder="<svg>...</svg>"
                  aria-label="Logo SVG"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Preview</span>
                  <div
                    dangerouslySetInnerHTML={{ __html: logoIcon }}
                    style={{ filter: `hue-rotate(${logoColor}deg)` }}
                    className="flex items-center justify-center rounded-md bg-[#0a0e14] p-2 [&>svg]:h-8 [&>svg]:w-8"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Track>
        {disabledReason ? <p className="text-sm text-muted-foreground"><StatusDot tone="off" />{disabledReason}</p> : null}
      </div>
    </div>
  );
}
