import InputField from '../../components/input_field';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import imgLogo from '../../assets/images/etc/logo_title.png';
import imgCloudLeft from '../../assets/images/etc/cloud_left.png';
import imgCloudRight from '../../assets/images/etc/cloud_right.png';


function JoinPage (){
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const isValid = id.length >= 1 && password.length >= 1 && passwordConfirm === password && nickname.length >= 1;

    const handleIdInput = (value) =>{
        setId(value);
    };
    const handlePasswordInput = (value) =>{
        setPassword(value);
    };
    const handlePasswordConfirmInput = (value) =>{
        setPasswordConfirm(value);
    };
    const handleNicknameInput = (value) =>{
        setNickname(value);
    }
    return (
        <div className='w-full h-screen bg-space flex flex-col items-center'>
            <div className='header w-fit h-fit p-1'>
                <img className='w-[400px] h-[200px]' src={imgLogo} alt="타이틀 로고" />
            </div>

            <div className="relative w-[350px] h-auto">
                <div className="inputContainer flex flex-col w-[350px] h-auto pl-8 pt-8 bg-input-container-color rounded-[40px]">
                    <InputField id='id' title='아이디' type='text' placeholder='' onTextChange={handleIdInput} />
                    <InputField id='password' title='비밀번호' type='password' placeholder='' onTextChange={handlePasswordInput} />
                    <InputField id='passwordConfirm' title='비밀번호 확인' type='password' placeholder='' onTextChange={handlePasswordConfirmInput} />
                    <InputField id='nickname' title='닉네임' type='text' placeholder='' onTextChange={handleNicknameInput} />
                    
                    <div
                        className={`loginBtn w-[266px] h-[60px] mt-10 mb-4 flex justify-center items-center rounded-[40px] 
                        ${isValid ? 'bg-button-color' : 'bg-disabled-button-color cursor-not-allowed'}`}
                    >
                        <Link
                            to={isValid ? '/condition/:id' : '#'}
                            className={`font-semibold text-white text-xl ${isValid ? '' : 'pointer-events-none'}`}
                            onClick={(e) => {
                                if (!isValid){
                                    e.preventDefault();
                                }
                            }}
                        >
                            완료
                        </Link>
                    </div>
                </div>

                <img className="absolute w-[600px] h-[200px] -left-60 top-40" src={imgCloudLeft} alt="왼쪽 구름" />
                <img className="absolute w-[500px] h-[200px] -right-80 -top-10" src={imgCloudRight} alt="오른쪽 구름" />
            </div>
        </div>
    );
}
export default JoinPage;