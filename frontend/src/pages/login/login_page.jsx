import InputField from '../../components/input_field';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import imgLogo from '../../assets/images/etc/logo_title.png';
import imgCloudLeft from '../../assets/images/etc/cloud_left.png';
import imgCloudRight from '../../assets/images/etc/cloud_right.png';

function LoginPage(){
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const isValid = id.length >= 1 && password.length >= 1;

    const handleIdInput = (value) => {
        setId(value);
    };
    const handlePasswordInput = (value) => {
        setPassword(value);
    };

    return (
        <div className='w-full h-screen bg-space flex flex-col items-center'>
            <div className='header w-fit h-fit p-1'>
                <img className='w-[400px] h-[200px]' src={imgLogo} alt="타이틀 로고" />
            </div>

            <div className="relative w-[350px] h-auto">
                <div className="inputContainer flex flex-col w-[350px] h-auto pl-8 pt-8 bg-input-container-color rounded-[40px]">
                    <InputField id='id' title='아이디' type='text' placeholder='' onTextChange={handleIdInput} />
                    <InputField id='password' title='비밀번호' type='password' placeholder='' onTextChange={handlePasswordInput} />
                    
                    <div className='findContainer w-[280px] mt-2 flex justify-end'>
                        <Link className='text-input-text-color text-sm'>아이디 찾기</Link>
                        <div className='ml-1 mr-1 text-input-text-color text-sm'>|</div>
                        <Link className='text-input-text-color text-sm'>비밀번호 찾기</Link>
                    </div>

                    <div
                        className={`loginBtn w-[266px] h-[60px] mt-10 mb-4 flex justify-center items-center rounded-[40px] 
                        ${isValid ? 'bg-button-color' : 'bg-disabled-button-color cursor-not-allowed'}`}
                    >
                        <Link
                            to={isValid ? '/home' : '#'}
                            className={`font-semibold text-white text-xl ${isValid ? '' : 'pointer-events-none'}`}
                            onClick={(e) => {
                                if (!isValid){
                                    e.preventDefault();
                                }
                            }}
                        >
                            로그인
                        </Link>
                    </div>
                </div>

                <img className="absolute w-[600px] h-[200px] -left-60 top-40" src={imgCloudLeft} alt="왼쪽 구름" />
                <img className="absolute w-[500px] h-[200px] -right-80 -top-10" src={imgCloudRight} alt="오른쪽 구름" />
            </div>

            <div className='joinContainer flex m-4'>
                <div className='mr-3 font-medium text-[#BCBCBC] text-lg'>젤핏이 처음이라면?</div>
                <Link to="/join" className='font-semibold text-[#BCBCBC] text-lg underline'>회원가입</Link>
            </div>
        </div>
    );
}


export default LoginPage;