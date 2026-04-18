import { useTranslation } from 'react-i18next';
import { CategoryGamePage } from '@/components/CategoryGamePage';

const GameShows = () => {
  const { t } = useTranslation();
  return (
    <CategoryGamePage
      title={t('nav.gameShows')}
      activeTab="game-shows"
      category="game-shows"
      emptyMessage={t('games.noGamesFound')}
    />
  );
};

export default GameShows;
