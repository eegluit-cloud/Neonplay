import { useTranslation } from 'react-i18next';
import { CategoryGamePage } from '@/components/CategoryGamePage';

const TableGames = () => {
  const { t } = useTranslation();
  return (
    <CategoryGamePage
      title={t('nav.tableGames')}
      activeTab="table-games"
      category="table-games"
      emptyMessage={t('games.noGamesFound')}
    />
  );
};

export default TableGames;
