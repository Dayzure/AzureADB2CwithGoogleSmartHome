async function getDeviceInfos(userId) {
    devicesInfo = [];
    smartHomeDevice = {
        id: "SMART-G-01",
        type: "action.devices.types.LIGHT",
        traits: [
            'action.devices.traits.OnOff',
        ],
        name: {
            defaultNames: ['SmartCollab LED Lamp'],
            name: 'collablamp',
            nicknames: ['collaboration LED']
        },
        willReportState: false,
        deviceInfo: {
            manufacturer: 'Collaboration Summit',
            model: 'StaykovLED',
            hwVersion: '1.0',
            swVersion: '1.0'
        }
    };
    devicesInfo.push(smartHomeDevice);
    return devicesInfo;
}

async function onSync(context, req)
{
    userId = req.headers['x-ms-client-principal-id'];
    devicesInfo = await getDeviceInfos(userId);

    responseBody = {
        requestId: req.body.requestId,
        payload: {
            agentUserId: userId,
            devices: devicesInfo
        }
    };
    context.log('Returning: ' + JSON.stringify(responseBody));       
    context.res = {
            body: responseBody
    };
    return;
}

async function onExecute(context, req)
{
    userId = req.headers['x-ms-client-principal-id'];
    devicesInfo = await getDeviceInfos(userId);
    cmd = req.body.inputs[0].payload.commands[0].execution[0].command;
    if (cmd == 'action.devices.commands.OnOff') 
    {
        payloadObj = 
        {
            commands: 
            [
                {
                    ids: [devicesInfo[0].id],
                    status: "SUCCESS",
                    states: {
                        on: true,
                        online: true
                    }
                }
            ]
        }

        if(req.body.inputs[0].payload.commands[0].execution[0].params.on)
        {
            // get device ON state
            payloadObj.commands[0].states.on = true;
        }
        else
        {
            // get device OFF state
            payloadObj.commands[0].states.on = false;
        }

        responseBody = {
            requestId: req.body.requestId,
            payload: payloadObj
        };

        context.log('Returning: ' + JSON.stringify(responseBody));       
        context.res = {
                body: responseBody
        };
    }
}

async function onQuery(context, req)
{
    userId = req.headers['x-ms-client-principal-id'];
    devicesInfo = await getDeviceInfos(userId);
    requestedDeviceId = req.body.inputs[0].payload.devices[0].id;
    deviceId = devicesInfo[0].id
    deviceStates = {
        deviceId: {
            on: true, // check with state 
            online: true
        }
    }

    responseBody = {
        requestId: req.body.requestId,
        payload: {
            devices: deviceStates
        }
    };
    
    context.log('Returning: ' + JSON.stringify(responseBody));       
    context.res = {
            body: responseBody
    };
}

module.exports = async function (context, req) {
    //context.log('req: ' +  JSON.stringify(req));
    switch(req.body.inputs[0].intent) 
    {
        case 'action.devices.SYNC':
            context.log('Recognized SYNC intent');
            await onSync(context, req);
            break;
        case 'action.devices.EXECUTE':
            context.log('Recognized EXECUTE intent');
            await onExecute(context, req);
            break;
        case 'action.devices.QUERY':
            context.log('Recognized QUERY intent');
            await onQuery(context, req);
            break;
        default:
            context.log('Could not get valuable data from ' + JSON.stringify(req.body));
            break;
    }
    context.log('Exitting ....')
};