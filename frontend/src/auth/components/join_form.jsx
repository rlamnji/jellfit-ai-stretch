// 회원가입 폼 컴포넌트
// 컴포넌트
import InputField from "./input_field";

// 훅(커스텀 훅)
import { useJoinForm } from "../hooks/use_join_form";

function JoinForm(){
    {/* 커스텀 훅 */}
    const {isValid, handleIdInput, handlePasswordInput, handlePasswordConfirmInput, handleNicknameInput, handleJoin} = useJoinForm();
    
        return (
            <form className="inputContainer flex flex-col w-[350px] h-auto pl-8 pt-8 bg-input-container-color rounded-[40px]"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleJoin();
                    }}
            >
                {/* ID, PWD, PWDConfirm, Nickname SET */}
                <InputField id='id' title='아이디' type='text' placeholder='' onTextChange={handleIdInput} />
                <InputField id='password' title='비밀번호' type='password' placeholder='' onTextChange={handlePasswordInput} />
                <InputField id='passwordConfirm' title='비밀번호 확인' type='password' placeholder='' onTextChange={handlePasswordConfirmInput} />
                <InputField id='nickname' title='닉네임' type='text' placeholder='' onTextChange={handleNicknameInput} />
                        
                {/* 계정 생성 버튼 */}
                <div className={`loginBtn w-[266px] h-[60px] mt-10 mb-4 flex justify-center items-center rounded-[40px] 
                            ${isValid ? 'bg-button-color' : 'bg-disabled-button-color cursor-not-allowed'}`}
                >
                    <button className={`font-semibold text-white text-xl ${isValid ? '' : 'pointer-events-none'}`} type='submit'>
                            계정 생성하기
                    </button>
                </div>

            </form>
    )
}

export default JoinForm