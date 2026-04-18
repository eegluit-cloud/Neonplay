import { useTranslation } from 'react-i18next';
import { CategoryGamePage } from '@/components/CategoryGamePage';

const NewReleases = () => {
  const { t } = useTranslation();
  return (
    <CategoryGamePage
      title={t('nav.newReleases')}
      activeTab="new-releases"
      filterFn={(game) => game.isNew}
      emptyMessage={t('games.noGamesFound')}
    />
  );
};

export default NewReleases;
