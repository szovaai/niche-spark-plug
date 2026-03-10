

# Plan: AI-Powered Outcome Lock Auto-Fill

## What We're Building

Add a "Generate Outcome Lock with AI" button to the OutcomeLockCard that uses the product brief (title, concept, pain points, target audience) to auto-fill all 9 Outcome Lock fields via AI.

## Changes

### 1. New Edge Function: `supabase/functions/generate-outcome-lock/index.ts`
- Accepts `productBrief` (title, subtitle, concept, uniqueMechanism, painPoints) from the request body
- Uses the Lovable AI gateway (`google/gemini-3-flash-preview`) with a focused prompt that generates all 9 OutcomeLock fields
- Uses tool calling to extract structured JSON output matching the OutcomeLock interface
- Returns the filled OutcomeLock object
- Handles 429/402 errors properly

### 2. Update `src/components/wizard/OutcomeLockCard.tsx`
- Add new props: `productBrief` (Step1Product | null) to pass the product context
- Add a "Generate with AI" button (Sparkles icon) in the header area, visible only when unlocked
- On click, call the edge function, show loading state, and populate all fields via `setOutcomeLock`
- User can then review/edit the AI-generated fields before locking
- Toast on success/error

### 3. Update `src/components/wizard/WizardStep2.tsx`
- Pass `productBrief` prop to the OutcomeLockCard component

### 4. Update `supabase/config.toml`
- Register the new `generate-outcome-lock` function

