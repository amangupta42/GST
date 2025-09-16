'use client';

import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n';
import { languageNames, languageCoverage, saveUserLocale, type Locale } from '@/i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (locale: Locale) => {
    // Save user preference
    saveUserLocale(locale);

    // Navigate to the same page in the new locale
    router.replace(pathname, { locale });
    handleClose();
  };

  const currentLanguage = languageNames[currentLocale];

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={!compact ? <ExpandMoreIcon /> : undefined}
        variant="outlined"
        size={compact ? "small" : "medium"}
        sx={{
          minWidth: compact ? 'auto' : 120,
          textTransform: 'none',
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        {compact ? (
          currentLanguage.flag
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span>{currentLanguage.flag}</span>
            <Typography variant="body2" fontWeight="medium">
              {currentLanguage.native}
            </Typography>
          </Box>
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxHeight: 400,
            mt: 1,
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.50' }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight="medium">
            Choose Language / भाषा चुनें
          </Typography>
        </Box>
        <Divider />

        {Object.entries(languageNames).map(([locale, lang]) => {
          const isSelected = locale === currentLocale;
          const coverage = languageCoverage[locale as Locale];

          return (
            <MenuItem
              key={locale}
              onClick={() => handleLanguageChange(locale as Locale)}
              selected={isSelected}
              sx={{
                backgroundColor: isSelected ? 'primary.50' : 'transparent',
                '&:hover': {
                  backgroundColor: isSelected ? 'primary.100' : 'action.hover'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isSelected ? (
                  <CheckIcon color="primary" fontSize="small" />
                ) : (
                  <Typography variant="h6" sx={{ minWidth: 24, textAlign: 'center' }}>
                    {lang.flag}
                  </Typography>
                )}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body1"
                      fontWeight={isSelected ? "medium" : "regular"}
                      color={isSelected ? "primary.main" : "text.primary"}
                    >
                      {lang.native}
                    </Typography>
                    {locale !== 'en' && (
                      <Typography variant="body2" color="text.secondary">
                        ({lang.english})
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {(coverage.speakers / 1000000).toFixed(0)}M+ speakers • {coverage.states.length} states
                  </Typography>
                }
              />
            </MenuItem>
          );
        })}

        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Language preference is automatically saved
          </Typography>
        </Box>
      </Menu>
    </>
  );
}