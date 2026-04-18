import { useTranslation } from 'react-i18next';
import { CategoryGamePage } from '@/components/CategoryGamePage';

const BurstGames = () => {
  const { t } = useTranslation();
  return (
    <CategoryGamePage
      title={t('nav.burstGames')}
      activeTab="burst-games"
      category="burst-games"
      emptyMessage={t('games.noGamesFound')}
    />
  );
};

export default BurstGames;
