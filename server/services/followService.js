const Follow = require("../models/Follow");


const followUserIds = async (identifyUserId) => {
    try {
        let following = await Follow.find({ "user": identifyUserId })
                                    .select({ "followed": 1, "_id": 0 })
                                    .exec();

        let followers = await Follow.find({ "followed": identifyUserId })
                                    .select({ "user": 1, "_id": 0 })
                                    .exec();

        let followingClean = [];

        following.forEach(follow => {
            followingClean.push(follow.followed);
        });

        let followersClean = [];

        followers.forEach(follow => {
            followersClean.push(follow.user);
        });
                                
        return {
            following: followingClean,
            followers: followersClean
        };
    } catch (error) {
        return {};
    }
};

//ver si sigo al usuario y si me sigue
const followThisUser = async (identifyUserId, profileUserId) => {
    let following = await Follow.findOne({ "user": identifyUserId, "followed": profileUserId });

    let follower = await Follow.findOne({ "user": profileUserId, "followed": identifyUserId });

    return {
       following,
       follower
    };
}

module.exports = {
    followUserIds,
    followThisUser
}