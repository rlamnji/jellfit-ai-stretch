// 친구 페이지
// 라이브러리
import { useState } from 'react';

// 컴포넌트
import FriendList from '../components/friend_list';
import FriendSearch from '../components/friend_search';
import FriendRequest from '../components/friend_request';

function FriendPage() {

  const [selectedTab, setSelectedTab] = useState('내 친구');

  const renderContent = () =>{
    switch(selectedTab) {
      case '내 친구':
        return <FriendList setSelectedTab={setSelectedTab}/>;
      case '친구 검색':
        return <FriendSearch setSelectedTab={setSelectedTab}/>;
      case '요청 목록':
        return <FriendRequest setSelectedTab={setSelectedTab}/>;
      default:
        return <FriendList/>;
    }
  }

  return (
    <div>
      {renderContent()}
    </div>
  );
}

export default FriendPage;
