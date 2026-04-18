import { useTranslation } from 'react-i18next';
import { CategoryGamePage } from '@/components/CategoryGamePage';

const Featured = () => {
  const { t } = useTranslation();
  return (
    <CategoryGamePage
      title={t('nav.featured')}
      activeTab="featured"
      filterFn={(game) => game.isFeatured}
      emptyMessage={t('games.noGamesFound')}
    />
  );
};

export default Featured;
