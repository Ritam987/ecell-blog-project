import React from "react";

const CommentCard = ({ comment }) => {
  return (
    <div className="bg-gray-100 p-2 rounded-md mb-2">
      <p className="font-bold">{comment.user.name}</p>
      <p>{comment.text}</p>
    </div>
  );
};

export default CommentCard;
