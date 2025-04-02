import { Link } from 'react-router-dom';
import styles from '../../styles/pages/condition_page.module.css';
function ConditionPage (){
    console.log("컨디션 선택 페이지 진입");
    return (
        <div className={styles.conditionPage}>
            <h1>요즘 어디가 아프세요?</h1>
            <button>
                <Link to='/'>완료</Link>
            </button>
        </div>
    );
}
export default ConditionPage;