class ChannelObserver {
    constructor(connectionHandler, channelId, username) {
        this.connectionHandler = connectionHandler;
        this.channelId = channelId;
        this.channelIds = {};
        this.username = username;
        this.generalChannel = 'dbf646dc-5006-4d9f-8815-fd37514818ee';
        this.createChannel();
    }

    addEvent(msg) {
        if (msg.eventType === "updateChannelsList") {
            this.updateChannelsList(msg);
        }
    }

    emptyChannelList() {
        const myChannelList = document.getElementById("chatColumn");
        while (myChannelList.firstChild) myChannelList.removeChild(myChannelList.firstChild);
    }

    updateChannelsList(msg) {
        let channelsList = document.getElementById('chatColumn');
        msg.data.map(channel => {
            let isNotIncluded = !(this.channelIds[channel.id]);
            if (isNotIncluded) {
                let channelDiv = document.createElement('div');
                channelDiv.classList.add('row');

                let channelElement = document.createElement('a');
                channelElement.textContent = channel.name;
                channelElement.id = channel.id;
                channelElement.classList = 'channel';
                channelElement.onclick = function () {
                    this.displayChannel(channel.id);
                }.bind(this)

                let icon = document.createElement('a');
                icon.id = channel.id;
                if (channel.id === "dbf646dc-5006-4d9f-8815-fd37514818ee") {
                    icon.classList = 'icon-navbar glyphicon glyphicon-star'
                    this.channelIds[channel.id] = 'active';
                    document.getElementById('textbox').disabled = false;
                    this.displayChannel(channel.id);
                } else {
                    icon.classList = 'icon-navbar glyphicon glyphicon-plus'
                    this.channelIds[channel.id] = 'disabled';
                }

                icon.onclick = function () {
                    this.switchChannel(channel.id)
                }.bind(this)
                channelDiv.appendChild(icon);
                channelDiv.appendChild(channelElement);
                channelsList.appendChild(channelDiv);
            }
        });
    }

    switchChannel(id) {
        if (this.channelIds[id] === 'active') {
            this.leaveChannel(id);
        } else {
            this.joinChannel(id);
        }
    }

    leaveChannel(id) {
        const leaveMessage = new Message("onLeaveChannel", id, "", this.username, Date.now());
        this.connectionHandler.sendMsg(leaveMessage);
        this.channelIds[id] = 'disabled';
        if (id !== this.generalChannel) {
            let icon = document.getElementById(id);
            icon.classList = 'icon-navbar glyphicon glyphicon-plus';
            document.getElementById('textbox').disabled = true;
        }
    }

    displayChannel(id) {
        if (id === "dbf646dc-5006-4d9f-8815-fd37514818ee" || this.channelIds[id] === "active") {
            document.getElementById('textbox').disabled = false;
        } else if (this.channelIds[id] === "disabled") {
            document.getElementById('textbox').disabled = true;
        }
        this.channelId = id;
        this.connectionHandler.setChannelId(id);
        this.connectionHandler.loadPreviousMessage(this.channelId);
    }

    joinChannel(id) {
        const joinnedMessage = new Message("onJoinChannel", id, "", this.username, Date.now());
        this.connectionHandler.sendMsg(joinnedMessage);
        this.channelIds[id] = 'active';
        if (id !== this.generalChannel) {
            let icon = document.getElementById(id);
            icon.classList = 'icon-navbar glyphicon glyphicon-minus';
            document.getElementById('textbox').disabled = false;
        }
    }

    createChannel() {
        let newChannel = document.getElementById('add-channel');
        newChannel.onclick = function () {
            let name = prompt('Please enter a channel name');
            if (name !== null) {
                let createChannel = new Message("onCreateChannel", "", name, this.username, Date.now());
                this.connectionHandler.sendMsg(createChannel);
                createChannel.eventType = "updateChannelsList";
                this.connectionHandler.sendMsg(createChannel);
            }
        }.bind(this)
    }
}