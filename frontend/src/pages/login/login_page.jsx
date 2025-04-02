import styles from '../../styles/pages/login_page.module.css';
import InputField from '../../components/input_field';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function LoginPage(){
    let isValid = false;
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const handleIdInput = (value) =>{
        setId(value);
    }
    const handlePasswordInput = (value) =>{
        setPassword(value);
    }
    isValid = id.length >= 2 && password.length >= 8;

    return (
        <div className={styles.loginPage}>
            <h1>JellFit</h1>
            <div className="inputContainer">
                <InputField id='id' title='아이디' type='text' placeholder='아이디를 입력하세요' onTextChange={handleIdInput}   />
                <InputField id='password' title='비밀번호' type='password' placeholder='비밀번호를 입력하세요' onTextChange={handlePasswordInput}/>
                <div>
                    {/* 아이디&비밀번호 입력 후 활성화 */}
                    <button className={isValid ? styles.activeLoginBtn : styles.LoginBtn} disabled={!isValid}>
                        <Link to='/home'>로그인</Link>
                    </button>
                </div>
                <div>
                    <button className='joinBtn'>
                        {/* 버튼 클릭 시 아이디&비밀번호 매칭 : 실패 시 알람 */}
                        <Link to='/join'>회원가입</Link>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;