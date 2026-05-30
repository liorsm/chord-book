import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';

const heroBgUrl = `${import.meta.env.BASE_URL}bg-hero.jpg`;

export default function HeroSection({ title, children, contentMaxWidth = 'md' }) {
  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 6, md: 10 },
        px: 2,
        textAlign: 'center',
        borderRadius: { md: 0 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${heroBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(81, 181, 229, 0.5) 0%, rgba(74, 140, 230, 0.5) 35%, rgba(83, 86, 224, 0.5) 65%, rgba(125, 38, 223, 0.5) 100%);',
        }}
      />
      <Container maxWidth={contentMaxWidth} sx={{ position: 'relative', zIndex: 1 }}>
        {title != null && (
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 4,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  );
}
