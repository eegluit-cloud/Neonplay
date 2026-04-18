import { useTranslation } from 'react-i18next';
import { CategoryGamePage } from '@/components/CategoryGamePage';

const Blackjack = () => {
  const { t } = useTranslation();
  return (
    <CategoryGamePage
      title={t('nav.blackjack')}
      activeTab="blackjack"
      category="blackjack"
      emptyMessage={t('games.noGamesFound')}
    />
  );
};

export default Blackjack;
