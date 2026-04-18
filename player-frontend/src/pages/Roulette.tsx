import { useTranslation } from 'react-i18next';
import { CategoryGamePage } from '@/components/CategoryGamePage';

const Roulette = () => {
  const { t } = useTranslation();
  return (
    <CategoryGamePage
      title={t('nav.roulette')}
      activeTab="roulette"
      category="roulette"
      emptyMessage={t('games.noGamesFound')}
    />
  );
};

export default Roulette;
