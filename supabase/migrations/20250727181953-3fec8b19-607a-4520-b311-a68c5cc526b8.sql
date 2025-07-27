-- Populate color_badge column with institutional colors for each status
UPDATE public.status SET color_badge = '#E7E9F3' WHERE label = 'I Ri';           -- Light gray for new applications
UPDATE public.status SET color_badge = '#FFA726' WHERE label = 'Në Shqyrtim';    -- Orange for under review
UPDATE public.status SET color_badge = '#29B6F6' WHERE label = 'Në Progres';     -- Blue for in progress
UPDATE public.status SET color_badge = '#AB47BC' WHERE label = 'Në Mentorim';    -- Purple for mentoring
UPDATE public.status SET color_badge = '#142657' WHERE label = 'Në Prezantim';   -- Institutional blue for presentation
UPDATE public.status SET color_badge = '#66BB6A' WHERE label = 'I Pranuar';      -- Green for accepted
UPDATE public.status SET color_badge = '#EF5350' WHERE label = 'I Refuzuar';     -- Red for rejected
UPDATE public.status SET color_badge = '#26A69A' WHERE label = 'Në Implementim'; -- Teal for implementation
UPDATE public.status SET color_badge = '#d4af37' WHERE label = 'Zbatuar';        -- Gold for completed/implemented