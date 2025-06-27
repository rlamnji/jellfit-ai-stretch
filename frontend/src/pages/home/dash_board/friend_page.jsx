// 친구 페이지
import FriendList from '../../../components/friends/friend_list';
import FriendSearch from '../../../components/friends/friend_search';
import FriendRequest from '../../../components/friends/friend_request';
import { useState } from 'react';

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
