'use strict';

const _ = require('lodash');

const commonRequestHeaders = {
  'x-august-access-token': 'access token returned by OAuth',
  'x-august-api-key': 'key issued by August support'
};

const standardRequestHeaders = _.extend({}, commonRequestHeaders);
standardRequestHeaders['content-type'] = 'application/json';

const imageContentTypes = 'image/jpeg or image/png';

const imageRequestHeaders = _.extend({}, commonRequestHeaders);
imageRequestHeaders['content-type'] = imageContentTypes;

const commonResponseHeaders = {
  'content-type': 'application/json',
  'x-response-time': 'response time in ms',
  'x-august-access-token': 'session token from OAuth'
};

const standardResponseHeaders = _.extend({}, commonResponseHeaders);
standardResponseHeaders['content-type'] = 'application/json';

const imageResponseHeaders = _.extend({}, commonResponseHeaders);
imageResponseHeaders['content-type'] = imageContentTypes;

var publicPaths = {
  '0.0.1': {
    'GET /apidesc': {
      name: 'Documentation',
      summary: 'Get this Document',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: 'JSON object containing all the information herein'
      },
      permissions: ['docs'],
      note: ''
    },
    'GET /users': {
      name: 'Check user',
      summary: 'Check existence of a user in the system',
      method: 'get',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'GET /users/:otherUserID': { // path
      name: 'Get User Information',
      summary: 'Get information on a user',
      method: 'get',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          UserID: '<server-generated unique user ID>',
          ifPresent: {
            UserName: '<user name to log in to web page, etc.>',
            Email: '<email address>',
            FirstName: '<first name>',
            LastName: '<last name>',
            PhoneNo: '<phone number>',
            Type: '<user type>',
            UpdateInterval: 'integer'
          },
        },
      },
      note: '`/users/me` will return information for calling (OAuth\'d) user,' +
        'whereas `/users/:userID` will return the information ' +
        'for the user specified by `:userID`.  Returns _Not Found_ if userID does not exist.\n\n' +
        '* `locks` is a hash of `{lockID: "User type (superuser|manager|user)"}`\n' +
        '* `houses` is a hash of `{houseID: "User type (superuser|manager|user)}`\n"'
    },
    'GET /users/houses/mine': { // path
      name: 'Get Houses',
      summary: 'Get a list of calling user\'s houses.',
      method: 'get',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          HouseID: '<house ID>',
          HouseName: '<house name>',
          type: '<user type for calling user>'
        }, {
          HouseID: '<house ID>',
          HouseName: '<house name>',
          type: '<user type for calling user>'
        }, ]
      },
      note: 'At least a house name is required.  The only error from this function is Bad Request when no house name is provided.'
    },
    'GET /houses/:houseID': { // path
      name: 'Get House',
      summary: 'Get information about an existing house',
      // GETing from /houses/:houseID returns the house specified by houseID
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          HouseName: '<Name of house>',
          ifPresent: {
            users: {
              userid: 'type - type of user',
              userid2: 'type - type of user'
            },
            locks: ['lockid1', 'lockid2', '...', 'lockidn']
          },
        },
      },
      note: 'users is a hash of {userID: usertype (superuser|manager|user)}',
    },
    'GET /users/locks/mine': { // path
      name: 'Get Locks',
      summary: 'Get list of calling user\'s locks',
      method: 'get',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          'lockID1': {
            LockName: 'name of lock',
            UserType: '<user type>',
            macAddress: 'mac address of lock',
            HouseID: 'ID of house to which lock belongs',
            HouseName: 'Name of house to which lock belongs'
          },
          'lockID2': {
            LockName: 'name of lock',
            UserType: '<user type>',
            macAddress: 'mac address of lock',
            HouseID: 'ID of house to which lock belongs',
            HouseName: 'Name of house to which lock belongs'
          },
        },
      },
      note: 'Returns an empty body if the calling user has no locks',
    },
    'GET /users/doorbells/mine': { // path
      name: 'Get Doorbells',
      summary: 'Get list of calling user\'s doorbells',
      method: 'get',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          'doorbellID1': {
            serialNumber: '',
            bridgeID: null,
            appID: '',
            installUserID: '',
            name: '',
            type: '',
            operative: false,
            installDate: '',
            osVersionHistory: {},
            bridgeAppVersionHistory: {},
            doorbellAppVersionHistory: {},
            currentOSVersion: '',
            currentBridgeAppVersion: '',
            currentDoorbellAppVersion: '',
            pubsubChannel: '',
            HouseID: ''
          }
        },
      },
      note: 'Returns an empty body if the calling user has no locks',
    },
    'GET /users/bridges/mine': { // path
      name: 'Get Bridges',
      summary: 'Get list of calling user\'s bridges',
      method: 'get',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          'bridgeID1': {
            locks: [
              'lockID'
            ],
            appID: 'august-iphone',
            deviceModel: 'august-connect',
            firmwareVersion: '2.1.27',
            operative: true
          },
          'bridgeID2': {
            locks: [
              'lockID'
            ],
            appID: 'august-iphone',
            deviceModel: 'august-connect',
            firmwareVersion: '2.1.27',
            operative: true
          },
        },
      },
      note: 'Returns an empty body if the calling user has no bridges',
    },
    'GET /locks/:lockID': { // path
      name: 'Get Lock',
      summary: 'Get information about an existing lock',
      // GETing from /locks/:lockID returns db.locks[{LockID: lockID}]
      method: 'get',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          LockName: 'Text string',
          Type: 'lock type',
          Updated: 'date',
          Created: 'date',
          LockID: 'unique ID of lock',
          HouseID: 'id of house to which lock belongs',
          ifPresent: {
            users: {
              'userid': 'user type',
              'userid2': 'user type',
              '...': '...',
              'useridN': 'user type'
            },
            ruleHash: {
              ruleID: {
                startTime: 'start time in ISO 8601 format',
                duration: 'duration',
                schedule: 'Rule schedule in iCalendar data format (RFC 5545)'
              }
            }
          },
          homeKitUniqueIdentifier: 'id of homeKit to which lock belongs to',
          '[hostLockInfo]': 'Information about the host lock',
          '[hostID]': 'Host lock\'s ID',
          '[hostHardwareLockInfo]': 'Information about the host hardware',
          '[hostHardwareID]': 'Host hardware\'s ID',
          '[pins]': {
            created: 'array of the unique lock & user which state is created',
            loaded: 'array of the unique lock & user which state is loaded',
            disabled: 'array of the unique lock & user which state is disabled',
            disabling: 'array of the unique lock & user which state is disabling',
            enabling: 'array of the unique lock & user which state is enabling',
            deleting: 'array of the unique lock & user which state is deleting',
            updating: 'array of the unique lock & user which state is updating',
          },
        },
      },
      note: 'Returns `resource not found` if lockID does not exist ' +
        'and `not authorized` if the user is not a user of the lock.' +
        'For the key pins:' +
        'created: means that the PIN should be loaded onto the lock, first step of associating a pin ' +
        'loaded: means that the PIN has been loaded to the lock, second and final step of associating a pin ' +
        'deleting: means that the PIN should be deleted, first step of removing a pin from a lock ' +
        'deleted: means that the PIN has been be deleted from the lock ' +
        'disabling: means the the PIN should be disabled ' +
        'disabled: means that the PIN has been marked as disabled on the lock ' +
        'enabling: means that the PIN should be enabled ' +
        'enabled: means that the PIN has been enabled, which means that it is back in the loaed group of PINs. '
    },
    'PUT /locks/adduser/:lockID/:otherUserID/:type': { // path
      name: 'Add otherUser to lockID managed by calling user',
      summary: 'Give a user access to a lock',
      method: 'PUT',
      // PUTing to /locks/adduser/:lockID/:otherUserID/:type adds otherUserID to lockID with type type
      request: {
        headers: standardRequestHeaders,
        body: {
          optional: {
            Name: 'string containing name of person to be granted access to lock'
          }
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'The only response to this function is a status code.  Returns Bad Request if lock does not exist, otherUser ' +
        'does not exist, or type is invalid.  Valid typs are "user" and "manager".  Returns Unauthorized if calling user is not a manager or superuser of lock',
    },
    'PUT /remoteoperate/:lockID/:command': {
      name: 'remote lock operation',
      summary: 'operate a lock remotely through a bridge, if present',
      method: 'put',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          status: 'the status of the lock at the end of the operation. ' +
            'One of: kAugLockState_Locked, kAugLockState_unlockedkAugLockState_Locked, kAugLockState_UnknownStaticPosition',
          doorState: 'the door state status of the lock' +
            'One of: kAugDoorState_Init, kAugDoorState_Closed, kAugDoorState_Ajar, kAugDoorState_Open, kAugDoorState_Unknown',
          info: {
            action: 'requested action',
            startTime: 'when the request was received by the remote bridge server',
            duration: 'the duration in second of the full transaction between the remote bridge server and the bridge'
          }
        }
      },
      note: '###Commands:\n' +
        'Valid commands are `lock`, `unlock`, `status`, `reboot`, `telemetry`, and `unlatch`.\n\n' +
        'If the calling user is not authorized to use the lock a this time, it returns Unauthorized.\n\n' +
        '###Call Types:\n' +
        'This endpoint accepts a query string parameter "type". \n' +
        'Valid types are either "sync" or "async". If type is not provided the default is sync\n' +
        'An async request will return immediately and return the operation\'s result using a communications channel defined in the request\'s payload\n' +
        '###Return values:\n' +
        'Status | message\n' +
        '------ | -------\n' +
        ' 200 | resultObject\n' +
        ' 202 | accepted if the request asked for async processing\n' +
        ' 423 | "lock in use" if there is already a pending remote operation\n' +
        ' 500 | _errorMessage varies_ if there was an error communicating with the lock (check the message returned)\n' +
        ' 501 | "not implemented", if the command is not valid\n'
    },
    'DELETE /remoteoperate/:lockID/transactions/:txid': {
      name: 'cancel remote lock operation',
      summary: 'cancel a previous remote operation of a lock through a bridge',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'If the calling user is not authorized to use the lock a this time, it returns Unauthorized.'
    },
    // NOTE: this endpoint must be defined before 'PUT /locks/:lockID/:otherUserID/:type'
    // otherwise the later overrules this endpoint
    'PUT /locks/:lockID/pins/sync': {
      name: 'Trigger remote sync PINs',
      summary: 'Allows a client to trigger remote sync process of PINs to a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          channelID: 'string',
          numRecords: 'string'
        }
      },
      note: 'return status codes: \n\n' +
        'Status | Meaning\n' +
        '------ | -------\n' +
        ' 200 | Ok, but nothing to do. \n' +
        ' 202 | Synchronization will start soon. \n' +
        ' 409 | No bridge associated or the bridge is offline.'
    },
    'PUT /locks/:lockID/:otherUserID/:type': { // path
      name: 'Set User Type',
      summary: 'Sets otherUsers\'s type on lock specified by lockID managed by calling user.',
      method: 'put',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'This sets otherUser\'s user type to type for lock lockID. This can only be done if the calling user is a ' +
        'superuser of the lock. If other user is an invitee the invitation is updated. Returns Unauthorized if ' +
        'calling user is not the superuser of the lock. Returns Not Found ' +
        'if lockID or otherUserID do not exist or there is no corresponding invitation for other user. Returns Bad Request ' +
        'if type is not valid',
    },
    'DELETE /locks/:lockID/:otherUserID': { // path
      name: 'Remove User From Lock',
      summary: 'Deletes user specified by userID from lock specified by lockID',
      method: 'delete',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Returns Unauthorized if the calling user is not able to manage the lock.  Returns Not Found if lock or otherUser ' +
        'do not exist.',
    },
    'POST /houses/:houseID/guestbook': {
      name: 'Add a guestbook entry',
      summary: 'create a new guestbook entry',
      method: 'POST',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'GET /houses/:houseID/guestbookentries/count': {
      name: 'get the number of guestbook entries',
      summary: 'determines the number of guestbook entries and returns it in the response body',
      method: 'GET',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'GET /houses/:houseID/guestbookentries/:count/:start': {
      name: 'Guestbook entry list',
      summary: 'Get summary of up to "count" guestbook entries starting with "start"',
      method: 'GET',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'GET /houses/guestbookentry/:entryID': {
      name: 'get a guestbook entry',
      summary: 'returns the guestbook entry specified by entryID',
      method: 'GET',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'DELETE /houses/guestbookentry/:entryID': {
      name: 'delete guest book entry',
      summary: 'Deletes a guestbook entry from a house',
      method: 'DELETE',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'GET /locks/logs/:lockID/:startDateTime/:endDateTime': { // path
      name: 'Get logs for a lock',
      summary: 'retrieves logs for :lockID from :startDateTime to :endDateTime',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          dateTime: 'YYYY-MM-DDTHH:MM:SS.mmmZ (year-month-dayThours:minutes:seconds.milisecondsZ)',
          LockID: 'Lock ID',
          action: 'LOCK, UNLOCK, ADD, REMOVE',
          callingUser: 'User information for calling user (See GET /users/:userID)',
          otherUser: 'user informmation for the operand of a GRANT/DENY action (See GET /users/:userID)',
        }, {
          dateTime: 'YYYY-MM-DDTHH:MM:SS.mmmZ (year-month-dayThours:minutes:seconds.milisecondsZ)',
          LockID: 'Lock ID',
          action: 'LOCK, UNLOCK, GRANT, DENY',
          callingUser: 'User information for calling user (See GET /users/:userID)',
          otherUser: 'user informmation for the operand of a GRANT/DENY action (See GET /users/:userID)',
        }, ]
      },
      note: 'returns 200 if date range and lockID can be satisfied.  404 otherwise.'
    },
    'GET /activity/:startDateTime/:endDateTime': {
      name: 'Get activity',
      summary: 'Gets 100 most recent activities across all lock I can use.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          logEntries: [{
            'dateTime': 'milliseconds since epoch',
            'action': '<lock, unlock, add, remove, addtorule, removefromrule>',
            'callingUserID': '65ced7f1',
            'LockID': '<Lock ID>'
          }],
          users: {
            'userID1': {
              'UserID': '<user id>',
              'FirstName': '<first name>',
              'LastName': '<last name>',
              'UserName': '<user name>',
              'PhoneNo': '<phone number>',
              'imageInfo': {
                'original': {
                  'width': '<image width>',
                  'height': '<image height>',
                  'format': '<jpg,png, etc>',
                  'url': 'http url to image',
                  'secure_url': 'https url to image'
                },
                'thumbnail': {
                  'width': '<image width>',
                  'height': '<image height>',
                  'format': '<jpg,png, etc>',
                  'url': 'http url to image',
                  'secure_url': 'https url to image'
                }
              }
            }
          },
          houses: {
            'houseID1': {
              'HouseName': '<house name>',
              'HouseID': '<house ID>',
            }
          },
          locks: {
            'lockID1': {
              'LockID': '<lock ID>',
              'LockName': '<Lock name>',
              'HouseID': '<house ID>',
            }
          }
        }
      },
      note: 'Limit of 100 entries returned. ' +
        'Returns activity on locks callingUser managers or superuses. ' +
        'Returns only callingUsers\'s activity on locks where he is a user.'
    },
    'GET /locks/log/after/:lockID/:dateTime/:count': {
      name: 'get a number of log entries',
      summary: 'Gets last `:count` log entries for `:lockID` after `:dateTime` (ms since epoch)',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          dateTime: 'milliseconds since epoch',
          LockID: 'Lock ID',
          action: 'LOCK, UNLOCK, GRANT, DENY',
          callingUser: 'User information for calling user (See `GET /users/:userID`)',
        }
      },
      note: 'dateTime is in ms since epoch, so unix time must be multiplied by 1000 to get the correct value'
    },
    'GET /locks/log/before/:lockID/:dateTime/:count': {
      name: 'get a number of log entries',
      summary: 'Gets last :count log entries for :lockID before :dateTime (ms since epoch)',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          dateTime: 'milliseconds since epoch',
          LockID: 'Lock ID',
          action: 'LOCK, UNLOCK, GRANT, DENY',
          callingUser: 'User information for calling user (See GET /users/:userID)',
        }
      },
      note: 'dateTime is in ms since epoch, so unix time must be multiplied by 1000 to get the correct value'
    },
    'POST /rules/:lockID': {
      name: 'Create a rule for a lock',
      summary: 'Create a usage rule for a lock, which can be applied to a user',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          startTime: 'First time when usage window opens (ISO 8601 format)',
          endTime: 'First time when usage window closes (ISO 8601 format)',
          recurrence: 'expression of rule\'s recurrence (see notes)'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          ruleID: 'unique ID of rule'
        }
      },
      note: 'This API creates a rule which, when applied to a user, allows the user to operate the lock in the specified time frame.  ' +
        'Recurrence is specified as an iCalendar RFC RRULE string.'
    },
    'POST /rules/rulewithuser/:lockID/:otherUserID': {
      name: 'Create a rule for a lock and add a user to it',
      summary: 'Create a usage rule for a lock, and apply it to the user specified by otherUserID',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            startTime: 'First time when usage window opens  (ISO 8601 format)',
            endTime: 'First time when usage window closes  (ISO 8601 format)',
            recurrence: 'expression of rule\'s recurrence (see notes)',
            schedule: 'Rule schedule in iCalender data format (RFC 5545)'
          },
          optional: {
            Name: 'string containing name of person to be granted access to lock'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          ruleID: 'unique ID of rule'
        }
      },
      note: 'This API creates a rule which, when applied to a user, allows the user to operate the lock in the specified time frame.  ' +
        'Recurrence is specified as an iCalendar RFC RRULE string.'
    },
    'PUT /rules/:ruleID/:otherUserID': {
      name: 'Apply a rule',
      summary: 'Apply a rule to a user of a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Restricts user specified by otherUserID\'s access to to the lock specified in ruleID to the time specified in ruleID.  ' +
        'If user specified by otherUserID does not currently have access to the lock, access is granted for the time specified by ruleID.  ' +
        'If user specified by otherUserID currently has unrestricted access to the lock specified in ruleID, an error is returned. ' +
        'If the user currently has restricted access to to the lock specified by ruleID, his access is expanded to include the time ' +
        'specified by ruleID.  If the user specified by otherUserID is a manager or superuser of the lock, an error is returned.'
    },
    'GET /locks/rules/:lockID': {
      name: 'Get Rules',
      summary: 'Get a list of rules for a lock',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          LockID: 'lock ID',
          RuleID: 'Rule ID',
          startTime: 'start time for rule  (ISO 8601 format)',
          endTime: 'end time for rule  (ISO 8601 format)',
          users: [{
            UserID: 'user id',
            FirstName: 'first name',
            LastName: 'last name',
            Email: 'email address'
          }, {
            UserID: 'user id',
            FirstName: 'first name',
            LastName: 'last name',
            Email: 'email address'
          }, ]
        }
      },
      note: 'returns all relevant information about a lock rule'
    },
    'GET /locks/:lockID/users/sounds': {
      name: 'Get lock users sounds',
      summary: 'Get a map of sounds by users',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          '<userID>': {
            soundPackageID: 'sound package id'
          }
        }
      },
      note: 'returns only the users who have a sound package id'
    },
    'GET /locks/:lockID/sounds': {
      name: 'Returns list of sound packages available on lock for a known firmware version of the lock',
      summary: 'Returns list of sound packages available on lock for a known firmware version of the lock',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [
          {
            soundPackageID: 'sound package id',
            lockSoundURL: 'URL for sound file in a format playable on the iPhone and Android, hosted somewhere',
            unlockSoundURL: 'URL for sound file in a format playable on the iPhone and Android, hosted somewhere'
          }
        ]
      },
      note: 'Returns list of sound packages available on lock for a known firmware version of the lock'
    },
    'DELETE /rules/:ruleID/:otherUserID': {
      name: 'remove user from rule',
      summary: 'Removes the user specified by otherUserID from rule specified by ruleID',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'returns an error if rule does not exist'
    },
    'DELETE /rules/:ruleID': {
      name: 'remove rule',
      summary: 'removes rule specified by ruleID',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'returns an error if rule does not exist'
    },
    'GET /bridges/:bridgeID': {
      name: 'retrieve bridge info',
      summary: 'return the data associated with a bridge, including the lockIds',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          bridgeId: 'a unique manufacturer id',
          mfgId: 'manufacturer id',
          lockIds: 'an array of locks to be associated with the bridge',
          deviceModel: 'the model of the device',
          appID: 'the client used to create the bridge',
          firmwareVersion: 'the version reported by the bridge - this may or may not be provided for all manufacturers.'
        }
      },
      note: ''
    },
    'POST /webhook/:lockID' : {
      name:  'Add web hook',
      summary: 'Sets up the notification hook for the lock specified by lockID.',
      method: 'POST',
      request: {
        headers:  standardRequestHeaders,
        body:  {
          url: 'URL the August access control system will hit with notifications',
          method:  '"POST" or "GET"',
          token  :   'Token August access control system will present for authentication',
          header:   'Header in which authentication token will be provided',
          clientID : 'Client ID of third-party service provided by August',
          notificationTypes: 'Array of notification types. See Notes.'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body:  {
          message: 'OK'
        }
      },
      note:  '###notificationTypes\n' +
      'A JSON array containing one or more of: \n\n' +
      'notificationType | Meaning\n' +
      '---------------- | -------\n' +
      'operation | notification of lock usage\n' +
      'systemstatus | notification of change in connectivity of remote bridge to service\n' +
      'battery | notification of battery status requiring lock owner\'s attention\n' +
      'accessmgmt | notification of change in access to the lock by any user\n' +
      'configuration | notification of change in lock configuration including but not limited to lock name and addition/removal of bridge.\n\n' +
      '###Responses:\n' +
      'Code | Reason \n' +
      '---- | ------\n' +
      ' 200 | body = {"message": "OK"} call succeeded\n' +
      ' 401 | authorization token is not valid.\n' +
      ' 403 | * the user represented by the authorization token is not an owner of the lock\n' +
      '     | * the Client ID does not have permission to subscribe to notifications on behalf of the user\n' +
      '     | * or the x-august-api-key header is not valid.\n' +
      ' 404 | the clientID is not known to the system.\n'
    },
    'DELETE /webhook/:lockID/:clientID': {
      name:  'Delete Web Hook',
      summary: 'Deletes a webhook for an external service',
      method:  'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note:  'Deletes the webhook connection between an external service and lockID/callingUserID'
    },
    'POST /webhook/doorbell/:doorbellID' : {
      name:  'Add doorbell web hook',
      summary: 'Sets up the notification hook for the doorbell specified by doorbellID.',
      method: 'POST',
      request: {
        headers:  standardRequestHeaders,
        body:  {
          url: 'URL the August access control system will hit with notifications',
          method:  '"POST" or "GET"',
          token  :   'Token August access control system will present for authentication',
          header:   'Header in which authentication token will be provided',
          clientID : 'Client ID of third-party service provided by August',
          notificationTypes: 'Array of notification types. See Notes.'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body:  {
          message: 'OK'
        }
      },
      note:  '###notificationTypes\n' +
      'A JSON array containing one or more of: \n\n' +
      'notificationType | Meaning\n' +
      '---------------- | -------\n' +
      'motiondetected   | notification of motion detected by doorbell\n' +
      'videoavailable   | notification of doorbell video available\n' +
      'buttonpush       | notification of doorbell button pushed\n\n' +
      '###Responses:\n' +
      'Code | Reason \n' +
      '---- | ------\n' +
      ' 200 | body = {"message": "OK"} call succeeded\n' +
      ' 401 | authorization token is not valid.\n' +
      ' 403 | * the user represented by the authorization token is not an owner of the doorbell\n' +
      '     | * the Client ID does not have permission to subscribe to notifications on behalf of the user\n' +
      '     | * or the x-august-api-key header is not valid.\n' +
      ' 404 | the clientID is not known to the system.\n'
    },
    'DELETE /webhook/doorbell/:doorbellID/:clientID': {
      name:  'Delete Doorbell Web Hook',
      summary: 'Deletes a doorbell webhook for an external service',
      method:  'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note:  'Deletes the doorbell webhook connection between an external service and doorbellID/callingUserID'
    },
    'POST /webhook/user' : {
      name:  'Add user web hook',
      summary: 'Sets up the notification hook for the user specified by otherUserID.',
      method: 'POST',
      request: {
        headers:  standardRequestHeaders,
        body:  {
          url: 'URL the August access control system will hit with notifications',
          method:  '"POST" or "GET"',
          token  :   'Token August access control system will present for authentication',
          header:   'Header in which authentication token will be provided',
          clientID : 'Client ID of third-party service provided by August',
          notificationTypes: 'Array of notification types. See Notes.'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body:  {
          message: 'OK'
        }
      },
      note:  '###notificationTypes\n' +
      'A JSON array containing one or more of: \n\n' +
      'notificationType | Meaning\n' +
      '---------------- | -------\n' +
      'lockmembership | changes to a user/lock relationship\n\n' +
      '###Responses:\n' +
      'Code | Reason \n' +
      '---- | ------\n' +
      ' 200 | body = {"message": "OK"} call succeeded\n' +
      ' 401 | authorization token is not valid.\n' +
      ' 403 | * the user represented by the authorization token is not an owner of the doorbell\n' +
      '     | * the Client ID does not have permission to subscribe to notifications on behalf of the user\n' +
      '     | * or the x-august-api-key header is not valid.\n' +
      ' 404 | the clientID is not known to the system.\n'
    },
    'DELETE /webhook/user/:clientID': {
      name:  'Delete User Web Hook',
      summary: 'Deletes a user webhook for an external service',
      method:  'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note:  'Deletes the user webhook '
    },
    'GET /locks/:lockID/status': {
      name: 'Get lock status',
      summary: 'Returns the status of a lock from the locks collection.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          status: 'unlocked|locked|unknown|not-advertising',
          dateTime: 'UTC time of status update',
          isLockStatusChanged: 'boolean: whether or not status changed during previous update',
          valid: 'boolean: currently always true'
        }
      },
      note: 'Possible values \'locked,\' \'unlocked,\' \'unknown,\' \'not-advertising.\''
    },
    'GET /keypads/:keypadID': {
      name: 'retrieves keypad association info',
      summary: 'return the data associated with an associated keypad',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          serialNumber: 'the serial number of the keypad',
          lockID: 'the lock it is associated with',
          firmwareVersion: 'the version reported by the keypad'
        }
      },
      note: 'Calling user must be a lock super user.'
    },
    'GET /locks/:lockID/pins' :{
      name: 'Get Lock Pins',
      summary: 'Get all pins for a given lock.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          created: [{
            lockID: 'string',
            userID: 'string',
            pin: 'string',
            firstName: 'string',
            lastName: 'string'
          }],
          loaded: [],
          deleting: [],
          disabling: [],
          disabled: [],
          enabling: []
        }
      },
      note: 'Created, loaded, deleting, disabling, disabled, and enabled can all contain pin like objects.'
    },
    'POST /locks/:lockID/pins': {
      name: 'Manage PINs',
      summary: 'Load, delete, disable and enable PINs for users on a lock. ' +
        'Newer locks can support schedules on PINs.',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          commands: [
            {
              augustUserID: 'string: either a phone number identifier, email identifier or an August internal user ID',
              partnerUserID: 'string: an user id which will be used to report upon completion of each pin command',
              firstName: 'the firstName of the user, optional',
              lastName: 'the lastName of the user, optional',
              pin: 'string: a valid pin, ideally obtained in previous step to avoid failures',
              action: 'string: load, delete, disable, enable',
              accessType: 'string: the type of the pin: always, recurring, temporary, oneTime',
              accessTimes: 'string: this field only required for access types recurring & temporary; for recurring access type possible values are "STARTSEC=<sec from start of day>[;ENDSEC=<sec from start of day>]"; if timezone of lock is known this is also valid: "DTSTART=<ISO date in UTC>[;DTEND=<ISO date in UTC>]" (end date optional, if not provided is set to 1 hour from start date). For temporary times can be ISO date strings (DTSTART/DTEND) or epoch values, e.g. "STARTSEC=<epoch value>;[;ENDSEC=<epoch value>]." Not required when schedule is provided.',
              accessRecurrence: 'string: only required for access type recurring. See recurrence rules under RFC2445, e.g.: "FREQ=MONTHLY;BYMONTHDAY=10,15;COUNT=20". Not required when schedule is provided.',
              schedule: 'string: iCal data format following RFC5545 (https://tools.ietf.org/html/rfc5545) required for access types recurring & temporary; when accessTimes & accessRecurrence are provided, data of schedule overrides their values.',
              retry: 'boolean: indicates whether the command should be re-tried in case of failure, optional'
            }
          ]
        },
        webhook: 'url to post to with result, optional'
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'See [Remote PIN Management](https://partners.august.com/userguide/apiguide/remote-pin-management-for-the-august-keypad/)'
    },
    'GET /revision': {
      name: 'Get server revision',
      summary: 'Get information about the revision the server is running.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          revision: 'package.json version',
          gitCommitHash: 'Hash of the latest git commit'
        }
      },
      note: ''
    },
    'GET /doorbells/:doorbellID': { // path
      name: 'Get Doorbell',
      summary: 'Get information about an existing doorbell',
      // GETing from /doorbells/:doorbellID returns db.doorbells.find({doorbellID: doorbellID}))
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          doorbellID: 'String',
          bridgeID: 'String',
          serialNumber: 'String',
          appID: 'String',
          installUserID: 'String',
          name: 'String',
          type: 'Int',
          operative: 'Boolean',
          installDate: 'Date',
          osVersionHistory: 'Object',
          bridgeAppVersionHistory: 'Object',
          doorbellAppVersionHistory: 'Object',
          currentOSVersion: 'Version String',
          currentBridgeAppVersion: 'Version String',
          currentDoorbellAppVersion: 'Version String',
          pubsubChannel: 'String',
          LockID: 'String',
          settings: {
            motion_notifications: 'Boolean',
            enable_sound_on_doorbell: 'Boolean',
            // other doorbell settings ....
            powerProfilePreset: 'number',
          },
          chimes: 'Array',
          // e.g.
          // chimes: [{
          //   chimeID: 'cb63ed8b-b583-4c8c-ba16-f708e85de1ab',
          //   serialNumber: 'W1S0000001',
          //   type: 'chime_version_1',
          //   name: 'Bedroom Chime',
          // }, {
          //   chimeID: 'b6b98d04-74d9-483a-a52b-2cbff4a3561f',
          //   serialNumber: 'W1S0000002',
          //   type: 'chime_version_1',
          //   name: 'Hallway Chime',
          // }]
        },
      },
      note: 'Returns resource not found if doorbellID does not exist.'
    },
    'GET /doorbells/:doorbellID/logs/before/:endDateTime/:count': {
      name: 'Get Doorbell Logs Before T',
      summary: 'Gets doorbell logs before a specified time',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          logs: '[Array of log objects]'
        }
      },
      note: ':endDateTime should be a date object, a date string, or an integer like unix timestamp'
    },
    'GET /doorbells/:doorbellID/logs/after/:startDateTime/:count': {
      name: 'Get Doorbell Logs After T',
      summary: 'Gets doorbell logs after a specified time',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          logs: '[Array of log objects]'
        }
      },
      note: ':startDateTime should be a date object, a date string, or an integer like unix timestamp'
    },
    'GET /doorbells/:doorbellID/logs/before/:endDateTime/after/:startDateTime': {
      name: 'Get Doorbell Logs Between T1 and T2',
      summary: 'Gets doorbell logs before and after specified times',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          logs: '[Array of log objects]'
        }
      },
      note: 'startDateTime and :endDateTime should be a date object, a date string, or an integer like unix timestamp'
    },
    'GET /locks/:lockID/pin' :{
      name: 'generate pin',
      summary: 'generates an available random pin and reserve it for an system specified time',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          pin: 'the pin for this user'
        }
      },
      note: 'if there is no pin slot left (208 at the last count) it will return 409 (ConflictError)'
    },
    'GET /locks/:lockID/users/:otherUserID/credential' : {
      name: 'generate available pin/slot for a user with a type of lock credential',
      summary: 'generates an available random pin & slot number and reserve it for a system specified time',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          required: {
            type: 'string: pin, rf, finger'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          required: {
            pin: 'the pin for this user',
            slot: 'the slot for user',
          }
        }
      },
      note: 'if there is no pin slot left (208 at the last count) it will return 409 (ConflictError)\n' +
      'this endpoint is going to replace \'GET /locks/:lockID/pin\'\n' +
      'a slot only map to a unique user\'\n' +
      'the three different type of lock credentials will share the same slot for a user\'\n' +
      'type param is required in query'
    },
    'GET /locks/:lockID/credentials' : {
      name: 'query credentials with a lock',
      summary: 'query credentials in various states with a lock',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          optional: {
            type: 'string: pin, rf, finger'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          created: 'array of the unique lock & user which state is created',
          loaded: 'array of the unique lock & user which state is loaded',
          disabled: 'array of the unique lock & user which state is disabled',
          disabling: 'array of the unique lock & user which state is disabling',
          enabling: 'array of the unique lock & user which state is enabling',
          deleting: 'array of the unique lock & user which state is deleting',
          updating: 'array of the unique lock & user which state is updating',
        }
      },
      note: 'created: means that the CREDENTIAL should be loaded onto the lock, first step of associating a CREDENTIAL ' +
        'loaded: means that the CREDENTIAL has been loaded to the lock, second and final step of associating a CREDENTIAL ' +
        'deleting: means that the CREDENTIAL should be deleted, first step of removing a CREDENTIAL from a lock ' +
        'deleted: means that the CREDENTIAL has been be deleted from the lock ' +
        'disabling: means the the CREDENTIAL should be disabled ' +
        'disabled: means that the CREDENTIAL has been marked as disabled on the lock ' +
        'enabling: means that the CREDENTIAL should be enabled ' +
        'enabled: means that the CREDENTIAL has been enabled, which means that it is back in the loaed group of CREDENTIALS. ' +
        'if \'type\' is optional, the endpoint will query all credentials from the lock, otherwise it will return the unique type of lock credentials' +
        'if the callingUser is a lock manager, it will return all the credentials from the lock, otherwise it only return his locks\' credentials'
    },
    'GET /locks/:lockID/users/:otherUserID/settings' : {
      name: 'query user settings with a lock',
      summary: 'query user settings with a lock',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          lockID: 'specific ID of lock',
          userID: 'specific ID of user',
          accessType: 'the access type of the lock credential: always, recurring, temporary, oneTime',
          accessTimes: 'specifies during what timeframe access is valid',
          accessRecurrence: 'specifies recurrency rule of access',
          accessStartTime: 'start time of credential schedule',
          accessEndTime: 'end time of credential schedule',
          state: 'state of user credential schedule',
          loadedDate: 'date when the state of user credential schedule change to loaded',
          createdAt: 'date when the credential schedule created',
          updatedAt: 'date when the credential schedule updated',
        }
      },
      note: 'accessTimes only included in response when accessType in ["recurring", "temporary"]' +
        'accessRecurrence only included in response when accessType is recurring' +
        'accessStartTime only included in response when accessType is temporary' +
        'accessEndTime only included in response when accessType is temporary' +
        'loadedDate only included in response when state is loaded'
    },
    'PUT /locks/:lockID/users/:otherUserID/settings' : {
      name: 'set/update user settings for a lock',
      summary: 'set/update user settings for a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            state: 'string: the state of the lock credential schedule, which can be "load","delete","update","enable","disable"',
            action: 'string: the action of schedule operation, which can be "intent", "commit"',
            accessType: 'string: the type of the pin: always, recurring, temporary, oneTime',
            accessTimes: 'string: this field only required for access types recurring & temporary; for recurring access type possible values are "STARTSEC=<sec from start of day>[;ENDSEC=<sec from start of day>]"; if timezone of lock is known this is also valid: "DTSTART=<ISO date in UTC>[;DTEND=<ISO date in UTC>]" (end date optional, if not provided is set to 1 hour from start date). For temporary times must be ISO date in UTC. Not required when schedule is provided.',
            accessRecurrence: 'string: only required for access type recurring. See recurrence rules under RFC2445, e.g.: "FREQ=MONTHLY;BYMONTHDAY=10,15;COUNT=20". Not required when schedule is provided.',
            schedule: 'string: iCal data format following RFC5545 (https://tools.ietf.org/html/rfc5545) required for access types recurring & temporary; when accessTimes & accessRecurrence are provided, data of schedule overrides their values.'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          lockID: 'specific ID of lock',
          userID: 'specific ID of user',
          accessType: 'the access type of the lock credential: always, recurring, temporary, oneTime',
          accessTimes: 'specifies during what timeframe access is valid',
          accessRecurrence: 'specifies recurrency rule of access',
          accessStartTime: 'start time of credential schedule',
          accessEndTime: 'end time of credential schedule',
          state: 'state of user credential schedule',
          loadedDate: 'date when the state of user credential schedule change to loaded',
          createdAt: 'date when the credential schedule created',
          updatedAt: 'date when the credential schedule updated',
        }
      },
      note: 'accessTimes only included in response when accessType in ["recurring", "temporary"]' +
        'accessRecurrence only included in response when accessType is recurring' +
        'accessStartTime only included in response when accessType is temporary' +
        'accessEndTime only included in response when accessType is temporary' +
        'loadedDate only included in response when state is loaded'
    },
    'GET /locks/:lockID/users/settings' : {
      name: 'query all of the users settings with a lock',
      summary: 'query all of the users settings with a lock',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          created: 'array of the unique lock users settings which state is created',
          loaded: 'array of the unique lock users settings which state is loaded',
          disabled: 'array of the unique lock users settings which state is disabled',
          disabling: 'array of the unique lock users settings which state is disabling',
          enabling: 'array of the unique lock users settings which state is enabling',
          deleting: 'array of the unique lock users settings which state is deleting',
          updating: 'array of the unique lock users settings which state is updating',
        }
      },
      note: 'created: means that the schedule should be loaded onto the lock, first step of associating a schedule ' +
        'loaded: means that the schedule has been loaded to the lock, second and final step of associating a schedule ' +
        'deleting: means that the schedule should be deleted, first step of removing a schedule from a lock ' +
        'deleted: means that the schedule has been be deleted from the lock ' +
        'disabling: means the the schedule should be disabled ' +
        'disabled: means that the schedule has been marked as disabled on the lock ' +
        'enabling: means that the schedule should be enabled ' +
        'enabled: means that the schedule has been enabled, which means that it is back in the loaded group of schedules.\n' +
        'slot are included in array since mobile need to know the slot when set/update schedule.\n ' +
        'if the callingUser is a lock manager, it will return all the schedules from the lock'
    },
    'GET /users/cameras/mine' : {
      name: 'get cameras',
      summary : 'returns an array of cameras for the calling user',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: 'array of cameras'
      },
      note: 'camera data includes manufacturer\'s information if camera is not from August'
    },
    'GET /houses/:houseID/activity/:limit' : {
      name: 'Get House Logs.',
      summary: 'This gets all the logs for a given house.',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          endDate: 'This is a timestamp (epoch milliseconds) used to only return documents older than this date'
        },
      },
      response: {
        body: [{
          dateTime: Number,
          action: String,
          callingUser: Object,
          info: Object
        }]
      }
    },
    'GET /houses/:houseID/activities' : {
      name: 'Get House Logs.',
      summary: 'This gets all the logs for a given house, allows to provide a `limit` query string',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: [{
          dateTime: Number,
          action: String,
          callingUser: Object,
          info: Object
        }]
      }
    },
    'GET /users/:otherUserID/imageinfo': {
      name: 'get image info',
      summary: 'get information on images for otherUser that are specific to callingUser',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: imageResponseHeaders,
        body: {
          original: {
            width: 'width of original image',
            height: 'height of original image',
            format: 'format of original image',
            url: 'url of original image'
          },
          thumbnail: {
            width: 'width of thumbnail',
            height: 'height of thumbnail',
            format: 'format of thumbnail',
            url: 'url of thumbnail'
          }
        }
      },
      note: 'Generally, applications should use the thumbnail.  Returns ressource not found if the calling user has not set an image for the other user.'
    },
    'GET /doorbells/:doorbellID/diagnostics': {
      name: 'Get doorbell diagnostic information and wake doorbell',
      summary: 'Get doorbell diagnostic information and wake doorbell',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          wakeup: '<boolean> whether or not to tcp wakeup device'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          currentFirmwareVersion: '<string> empty string or the current firmware version',
          expectedFirmwareVersion: '<string> empty string or expected firmware version',
          batteryLow: '<boolean>',
          lastDoorbellUpdate: '<number> seconds after epoch',
          status: '<string> /doorbell_offline|doorbell_call_status_online|standby/, standby only applicable for D3',
          activeTcpWakeupConnection: '<boolean>, always false for D1 and D2',
          internalStatus: '<string> status used for tcp wakeup,  /online|offline|standby|wakingup|goingToSleep/ OR emptyString',
          hasActivePubsubConnection: '<boolean> internal status used for tcp wakeup response',
          tcpWakeupStatusCode: '<number> status code of tcp wakeup /200|202|412/, 0 if no tcp wakeup was requested in query parameters',
        }
      },
      note: 'Status Codes:\n' +
      '401 InvalidCredentialsError\n' +
      '  - The access token is invalid.\n' +
      '  - The user is blacklisted.\n' +
      '404 doorbellID does not exist or a NotAuthorizedError if user is not a user of the doorbell\n'
    },
    'GET /appdevices': {
      name: 'App device picker',
      summary: 'Get all app devices, intended for app device picker',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: '',
    },
    'GET /appdevices/resources': {
      name: 'Resources for a specific app device',
      summary: 'Device serial number is used to match app device record',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          '[serialNumber]': 'Device serial number',
          '[hhID]': 'The host hardware\'s ID',
          '[hID]': 'The host\'s ID',
          '[udID]': 'The universal ID of the device',
        }
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: '',
    },
    'GET /appdevices/:universalDeviceID': {
      name: 'Resources for a specific app device',
      summary: 'universalDeviceID matches the specific app device resource',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: '',
    },
    'PUT /locks/:lockID/settings': {
      name: 'Insert/update setting for specific lockID',
      summary: 'The request body will contain the setting keys with their values to change in the collection, "locks"',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          secureRemoteAccess: 'boolean',
          hideEntryCodes: 'boolean'
        }
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'Every key is optional, but there should always be at least one key, value pair.' +
          'Returns 403 if user is not a superuser of lock'
    },
    'GET /locks/:lockID/settings': {
      name: 'Get settings for a specific lockID',
      summary: 'Retrieves a list of settings from collection, "locks"',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          secureRemoteAccess: 'boolean',
          hideEntryCodes: 'boolean',
        }
      },
      note: 'body will return {} if settings object does not exist for specific lockID.'
    },
    'GET /devicepicker': {
      name: 'Device Picker',
      summary: 'This returns a device picker compatible for the requesting client',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          required: {
            version: 'semver of the app e.g 3.2.1',
            platform: 'string, \'ios\' or \'android\'',
          },
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          devices: [
            {
              // header fields
              type: "lock",
              // ...
              devices: []
            },
            // ...
          ]
        }
      },
      note: '',
    },
  },
  '2.0.0': {
    'GET /users': {
      name: 'Check user',
      summary: 'Check existence of a user in the system',
      method: 'get',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'GET /doorbells/:doorbellID': {
      name: 'Get Doorbell',
      summary: 'Get information about an existing doorbell and format settings',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          HouseID: 'String',
          HouseName: 'String',
          LockID: 'String',
          chimes: 'Array',
          // e.g.
          // chimes: [{
          //   chimeID: 'cb63ed8b-b583-4c8c-ba16-f708e85de1ab',
          //   doorbellID: 'f1a776a89e4d',
          //   serialNumber: 'W1S0000001',
          //   type: 'chime_version_1',
          //   name: 'Bedroom Chime',
          //   firmware: '4.8.1'
          // }]
          doorbellID: 'String',
          firmwareVersion: 'String',
          installUserID: 'String',
          invitations: 'Array',
          messagingProtocol: 'String',
          name: 'String',
          pubsubChannel: 'String',
          recentImage: 'Object',
          secChipCertSerial: 'String',
          serialNumber: 'String',
          settings: {
            buttonpush_notifications: 'Boolean',            // user setting
            buttonpush_notifications_partners: 'Boolean',   // user setting
            doorbellChime: 'Boolean',         //         v3
            flashBrightness: 'String',        //     v2
            indoorChimeEnabled: 'Boolean',    //     v2
            irConfiguration: 'Number',        // v1, v2
            motion_notifications: 'Boolean',                // user setting
            motionSensitivity: 'Number',      //         v3
            nightVision: 'String',            //         v3
            nightVisionBrightness: 'String',  //         v3
            notify_when_offline: 'Boolean',                 // user setting
            pirEnabled: 'Boolean',            // v1, v2
            pirSensitivity: 'Number',         // v1, v2
            powerProfilePreset: 'String',     //         v3
            ringSoundEnabled: 'Boolean',      // v1, v2
            speakerVolume: 'Number',          // v1, v2, v3
            videoResolution: 'String',        // v1, v2, v3
          },
          status: 'String',
          type: 'String',
          users: {
            'someUserID': {
              FirstName: 'String',
              LastName: 'String',
              UserType: 'String',
              identifiers: 'Array of Strings',
              imageInfo: 'Object'
            },
          }
        },
      },
      note: 'Returns resource not found if doorbellID does not exist.'
    },
    'PUT /doorbells/:doorbellID/settings/doorbell': {
      name: 'Update Doorbell Settings',
      summary: 'Update doorbell settings that are translated/transformed from client doorbell settings to validated doorbell settings',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        bodyHydra: {
          doorbellChime: '<boolean> true translated to on, false translated to off',
          speakerVolume: '<integer>  0 -> 100, translated as percent',
          powerProfilePreset: '<string> [optional] "default" || "custom"',
          motionSensitivity: '<integer> 0 -> 100, translated as percent',
          videoResolution: '<string> /low|medium|high/ where each are a resolution level that map to a resolution',
          nightVision: '<string> /on|off|auto/',
          nightVisionBrightness: '<string> /low|medium|high/'
        },
        bodyMars1: {
          pirEnabled: '<boolean> previous: IREnabled',
          videoResolution: '<string> /low|medium|high/ where each are a resolution level that map to a resolution',
          speakerVolume: '<integer>  0 -> 100, translated as percent',
          ringSoundEnabled: '<boolean> true translated to on, false translated to off',
          irConfiguration: '<integer> 0->100',
          pirSensitivity: '<number> 0->100'
        },
        bodyMars2: {
          pirEnabled: '<boolean> previous: IREnabled',
          videoResolution: '<string> /low|medium|high/ where each are a resolution level that map to a resolution',
          speakerVolume: '<integer>  0 -> 100, translated as percent',
          ringSoundEnabled: '<boolean> true translated to on, false translated to off',
          irConfiguration: '<integer> 0->100',
          pirSensitivity: '<number> 0->100, NEW hydra also has this key',
          flashBrightness: '<string> NEW /off|low|medium|high/, was 0-20=low,20-40=med, etc',
          indoorChimeEnabled: '<boolean> NEW, was bellTimerConfig (50=true,0=false)'
        },
      },
      serverTransformationsAndMappings:  {
        doorbellChime: 'maps to ringSoundEnabled',
        speakerVolume: 'doorbell.settings.speakerVolume, no transformation',
        advancedSettings: {
          powerProfilePreset: {
            '<integer>0': [
              'sets doorbell.settings from default preset',
              'ignores all settings in `advancedSettings` body and uses preset',
              'updates doorbell.powerProfilePreset = 0',
            ],
            '<integer>-1': [
              'sets doorbell.settings from the body.advancedSettings',
              'updates doorbell.powerProfilePreset = -1',
            ]
          },
          motionSensitivity: 'doorbell.settings.pirSensitivity, transformed to 0 - 95.',
          videoResolution: {
            low: 'doorbell.settings.videoResolution = `720x480`',
            medium: 'doorbell.settings.videoResolution = `1280x960`',
            high: 'doorbell.settings.videoResolution = `1920x1440`',
          },
          nightVision: {
            on: 'doorbell.settings.nightModeAlsThreshold = 100',
            auto: 'doorbell.settings.nightModeAlsThreshold = 100',
            off: 'doorbell.settings.nightModeAlsThreshold = 0',
          },
          nightVisionBrightness: {
            low: 'doorbell.settings.irLedBrightness = 153',
            medium: 'doorbell.settings.irLedBrightness = 102',
            high: 'doorbell.settings.irLedBrightness = 51'
          },
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Able to update individual fields\n'
    },
    'GET /locks/:lockID': {
      name: 'Get Lock',
      summary: 'Get information about an existing lock',
      method: 'get',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          LockName: 'Text string',
          Type: 'lock type',
          Updated: 'date',
          Created: 'date',
          LockID: 'unique ID of lock',
          HouseID: 'id of house to which lock belongs',
          currentFirmwareVersion: 'Object containing current firmware versions',
          '[users]': {
            'userid': 'user type',
            'useridN': 'user type'
          },
          '[ruleHash]': {
            ruleID: {
              startTime: 'start time in ISO 8601 format',
              duration: 'duration',
              schedule: 'Rule schedule in iCalendar data format (RFC 5545)'
            }
          },
          homeKitUniqueIdentifier: 'id of homeKit to which lock belongs to',
          '[hostLockInfo]': 'Information about the host lock',
          '[hostID]': 'Host lock\'s ID',
          '[hostHardwareLockInfo]': 'Information about the host hardware',
          '[hostHardwareID]': 'Host hardware\'s ID',
        },
      },
      note: 'Returns `resource not found` if lockID does not exist ' +
      'and `not authorized` if the user is not a user of the lock.' +
      'The differences between this version of the endpoint and the 0.0.1 version are these:' +
      '1. The type of the `currentFirmwareVersion` field has changed from a string to an object in this version.' +
      '2. The key `pins` removed from response in this version'
    },
  },
  '2.1.0': {
    'GET /partners': {
      name: 'get August partners enabled for display',
      summary: 'retrives a list of partners',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          _id: 'ID of partner',
          name: 'name of partner',
          heroImageURL: 'URL to partner hero image',
          partnerURL: 'URL to partner homepage',
          logoURL: 'URL to partner logo',
          wordmarkURL: 'URL to partner wordmark',
          partnerTagline: 'partner tagline',
          jointTagline: 'tagline tailored to August',
          partnerDescription: 'company description',
          jointDescription: 'service offering description',
          promotion: 'available partnership promotions',
          locations: 'where the service is provided',
        }]
      },
      note: ''
    },
  },
  '3.0.0': {
    'GET /houses/:houseID/activities' : {
      name: 'Get House Logs.',
      summary: 'This gets all the logs for a given house, allows to provide a `limit` query string',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: {
          events: [{
            timestamp: Number,
            action: String,
            deviceID: String,
            deviceType: String,
            user: Object,
            title: String,
          }],
          nextPage: Number,
          prevPage: Number,
        }
      }
    },
    'GET /partners': {
      name: 'get August partners enabled for display',
      summary: 'retrieves a list of partners',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          _id: 'ID of partner',
          name: 'name of partner',
          heroImageURL: 'URL to partner hero image',
          partnerURL: 'URL to partner homepage',
          logoURL: 'URL to partner logo',
          wordmarkURL: 'URL to partner wordmark',
          partnerTagline: 'partner tagline',
          jointTagline: 'tagline tailored to August',
          partnerDescription: 'company description',
          jointDescription: 'service offering description',
          promotion: 'available partnership promotions',
          locations: 'where the service is provided',
          stateCode: 'indicate the state of the partner',
        }]
      },
      note: ''
    },
  }
};

var public_spec = {
  protocol: 'https',
  port: 3030,
  paths:  publicPaths
};

// --------------------------------------------------

var privatePaths = {
  '0.0.1': {
    'GET /health': {
      name: 'Service Health Information',
      summary: 'Get service health information',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: 'JSON object containing health information'
      },
      note: ''
    },
    'POST /users': { // path
      name: 'Add User',
      summary: 'Creates a user account.',
      method: 'post',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            password: 'password for authentication'
          },
          optional: {
            FirstName: 'first name',
            LastName: 'last name',
          },
        },
        optional: {
          language: 'the language code',
          country: 'the country code',
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          UserID: 'unique identifier describing user',
          ifPresent: {
            UserName: 'username for use with login',
            Email: 'email address',
            PhoneNo: 'phone number'
          },
        },
      },
      note: ''
    },
    'PUT /users': {
      name: 'Update User',
      summary: 'Updates user information',
      method: 'put',
      request: {
        headers: standardRequestHeaders,
        body: {
          anyOf: {
            password: 'new password',
            FirstName: 'first name',
            LastName: 'last name',
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          anyOf: {
            password: 'new password',
            FirstName: 'first name',
            LastName: 'last name',
          }
        }
      },
      note: 'Updates the information for callingUser with the information provided.  Can be used to update password, phone number, ' +
        'email address, first name, last name, or username.  If username, email, or phone number already exist in the system, an error ' +
        'will be returned.  Returns an authorization error if no session key is provided or if session has expired.'
    },
    'POST /users/:otherUserID/image': {
      name: 'set image',
      summary: 'Set the image the calling user gets when retrieving information about the otherUser',
      method: 'POST',
      request: {
        headers: imageRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'POSTing to /users/:otherUserID will associate the image in the body with the other user when the calling user requests an ' +
        'image for the other user'
    },
    'GET /users/me/legal': {
      name: 'get the legal status',
      summary: 'returns the latest legal status of the user',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          approved: 'boolean true or false',
          documents: 'an array listing the names of documents that have not been approved. Current legal values: tos, eula, privacy'
        }
      },
      note: ''
    },
    'PUT /users/me/legal': {
      name: 'set the legal status',
      summary: 'sets the legal status of the user vs. eula, tos, privacy',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          approved: 'boolean: true or false'
        },
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'PUT /users/me/locale': {
      name: 'set language and locale',
      summary: 'sets the user\'s language and locale',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          language: 'string: lowercase two-letter ISO 639-1 language code',
          country: 'string: uppercase two-letter ISO 3166-1 alpha-2 country code'
        },
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'POST /session': { // path
      name: 'create a session',
      summary: 'verifies different identifers for a user and responds with an access token',
      method: 'post',
      request: {
        headers: standardRequestHeaders,
        body: {
          identifer: 'email or phone',
          installId: 'id of the device',
          password: 'users password'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'returns an error if trying to delete the last of an identifier type'
    },
    'DELETE /session/:identifier': {
      name: 'Delete sessions',
      summary: 'Deletes all session keys for the calling user',
      method: 'delete',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Deletes all sessions for the calling user. All subesequent API calls will respond that a new session must be retrieved.  ' +
        'Use in the case of a lost phone, etc.  identifer can be Email, in the form "email:<email>", or Phone Number in form "phone:+<country code><number with no spaces>"'
    },
    'POST /houses': { // path
      name: 'Create House',
      summary: 'Creates a new house for calling user and makes the user the superuser of the house',
      method: 'post',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            HouseName: 'description: <Name of house (home, "crash pad", ...)',
          },
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          HouseName: 'Name of house',
          HouseID: 'ID of House'
        },
      },
      note: 'At least a house name is required.  The only error from this function is Bad Request when no house name is provided.'
    },
    'PUT /houses/:houseID/image': {
      name: 'set house image',
      summary: 'Set the image the image for the house',
      method: 'PUT',
      request: {
        headers: imageRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'PUTing to /houses/:houseID/image will associate the image in the body with house and that image will be returned ' +
        'with house info'
    },
    'DELETE /houses/:houseID' : {
      name: 'Delete House',
      summary:  'removes a house',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Returns 412 if the house still has locks'
    },
    'GET /houses/:houseID/nestawaystatus': {
      name: 'Get Nest Away Status',
      summary: 'gets the Nest away status for a house that has been associated with a nest structure',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          'away': 'either home, away, or unknown'
        }
      },
      note: ''
    },
    'GET /houses/:houseID/temperature': {
      name: 'Get Temperature',
      summary: 'returns the temperature for a house',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          farenheit: 'temperature in degrees farenheit',
          celsius: 'temperature in degrees celsius'
        }]
      },
      note: 'size of body array will vary on number of sensors'
    },
    'PUT /houses/:houseID/nestawaystatus/:status': {
      name: 'Set Nest away status',
      summary: 'sets the away status for the Nest structure associcated with the specified August house',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'valid values for status are home and away.'
    },
    'PUT /houses/:houseID/neststructure/:structureID': {
      name: 'associate Nest structure',
      summary: 'assocites the specified Nest structure with the specified August house',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          StructureName: 'name of nest structure'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'DELETE /houses/:houseID/neststructure/:structureID': {
      name: 'disassociate Nest structure',
      summary: 'disassocites the specified Nest structure with the specified August house',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'DELETE /houses/lock/:houseID/:lockID': { // path
      name: 'Remove Lock',
      summary: 'Remove lock lockID from house houseID',
      method: 'delete',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Returns 200/OK if successful, 404 if lockID:houseID relationship is not found, and 403 if not authorized'
    },
    'DELETE /users/identifier/:identifier': {
      name: 'delete user identifier',
      summary: 'remove an identifier from a user',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'GET /users/identifier/:identifierType': {
      name: 'Get user identifier',
      summary: 'Gets a user\'s identifier of a certain type. Some identifier types may be created if none exists yet',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: {
          identifier: 'user identifier of requested type'
        }
      },
      note: ''
    },
    'POST /locks/:houseID': { // path
      name: 'Add Lock',
      summary: 'Adds a lock to a house.',
      // POSTing to /locks/:houseID adds the lock specified in the body to the house specified in the URI
      method: 'post',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            LockID: 'unique identifier of lock [see notes]',
            LockName: 'name of lock'
          },
          optional: {
            hostHardwareID: 'Host hardware\'s ID'
          },
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          LockID: '<unique ID of lock>',
          LockName: '<Text string>',
          Type: 'Integer.  Curently the only lock type supported is 1',
          Updated: 'YYYY-MM-DDTHH:MM:SS.mmmZ',
          Created: 'YYYY-MM-DDTHH:MM:SS.mmmZ',
          HouseID: 'ID of house to which lock was added'
        },
      },
      note: 'Requestor must provide UNIQUE ID of the lock.  If LockID or Name are not present, a ' +
        'Bad Request error is returned. If the user is not a manager or superuser of the house, a ' +
        'Not Authorized error is returned.'
    },
    'PUT /locks/:lockID': {
      name: 'Update Lock',
      summary: 'Update a lock\'s information',
      method: 'put',
      request: {
        headers: standardRequestHeaders,
        body: {
          anyOf: {
            LockName: 'name of lock',
            Calibrated: 'boolean. set to true if it\'s calibrated',
            homeKitUniqueIdentifier: 'id of homeKit that\'s specific to the lock'
          },
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          LockName: '<Text string>'
        }
      },
      note: 'Currently only Lock Name, their Calibration status, and their homeKit ID can be updated'
    },
    'PUT /locks/:lockID/resetkeys': {
      name: 'Reset offlinekeys',
      summary: 'Move all keys to deleted',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {},
      },
      response: {
        headers: standardResponseHeaders,
        body: {}
      },
      note: 'move all keys (except key index 0) to deleted'
    },
    'PUT /locks/acknowledgeparamupdate/:lockID': {
      name: 'acknowledge param update',
      summary: 'acknowledge update of params client was instructed to set by server',
      method: 'put',
      request: {
        headers: standardRequestHeaders,
        body: {
          '<parameter1 name>': '<parameter 1 value>',
          '<parameter2 namee': '<parameter 2 value>',
          '...': '<parameter value>',
          '<parameter n name>': '<parameter n value>'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'PUT /locks/:lockID/offlinekeys/:action': {
      name: 'Acquire known lock',
      summary: 'Acquire ownership of a known lock.',
      method: 'put',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            UserID: 'id of the user whom the offline key is assigned to',
            slot: 'slot to write the key'
          },
          optional: {
            key: 'key to write in the slot'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          message: 'success'
        }
      },
      note: ''
    },
    'PUT /locks/timeadjustment/:lockID/:realtime/:locktime': {
      name: 'Time Adjustment',
      summary: 'Inform server of time adjustment for a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'When a mobile device detects the clock on the lock is out of sync, it sets the time and informs the ' +
          'server of the adjustment.  Returns authorization error if callingUser is not able to use lock.  ' +
          'Returns success otherwise.'
    },
    'PUT /locks/timeadustment/:lockID/:realtime/:locktime': {
      name: 'Time Adjustment',
      summary: 'Inform server of time adjustment for a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'alias for PUT /locks/timeadjustment/:lockID/:realtime/:locktime (no j in timeadjustment)'
    },
    'PUT /locks/:lockID/users/:otherUserID/sound': {
      name: 'Set lock sound',
      summary: 'Set sound package id of lock.',
      method: 'put',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            soundPackageID: 'sound package id'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          message: 'success'
        }
      },
      note: ''
    },
    'POST /locks/setnotification/:lockID/:otherUserID/:on': {
      name: 'set notification',
      summary: 'sets notifications (lock, unlock, both, neither) when otherUser uses lock',
      method: 'POST',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'sends push notification to callingUser (phone or dashboard) when otherUser uses lock.  ' +
        'Values for \'on\':  lock - notifies on lock, unlock - notifies on unlock, both - notifies on both, ' +
        'neither disables notifications when otherUser uses lock'
    },
    'GET /locks/notifications/:lockID/:otherUserID' : {
      name:  'get notification for user on lock',
      summary: 'returns notifications for specified user on specified lock',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: 'JSON array of notifications for user'
      },
      note: 'returns all notifications calling user has for specified user on lock specified'
    },
    'PUT /locks/usage/:lockID': {
      name: 'usage',
      summary: 'inform service of lock usage',
      method: 'put',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            action: 'lock action--lock or unlock',
            mechanical: 'mechanical result:  success or failure',
            crypto: 'cryptographic result:  sucess or failure'
          }
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Notifies service of lock operation.  If a key is "in flight", it closes the loop and finalizes the process.  ' +
        'Creates a log entry for the usage, and triggers notifications to all clients listening for updates on the lock'
    },
    'GET /locks/:lockID/lockmessages': {
      name: 'get lock messages',
      summary: 'get messages regarding a lock',
      method: 'get',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'PUT /lockstatus/:lockID/:status': {
      name: 'lock status notification',
      summary: 'inform the service of the current status of the lock',
      method: 'put',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'POST /locks/log/:lockID/:action': { // path
      name: 'Add a log entry',
      summary: 'creates a log entry that :action was performed by callingUser at :dateTime',
      method: 'POST',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: '200 OK status is returned if all is well.  Returns invalid request if the action is not supported.  ' +
        'supported actions are:  \'lock\', \'unlock\', \'lockcommand\', and \'lockdata\'.  Date format is YYYYMMDDHHMMSSmmm.  If action is lockdata or lockcommand, ' +
        'body must contain data from the lock'
    },
    'POST /apns/devtoken': {
      name: 'add an APNS device token',
      summary: 'adds an APNS device token associated with the callingUser',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          apnstoken: 'token provided by iOS for the notification system.',
          voiptoken: 'token provided by iOS for the VOIP notification system.'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'PUT /apns/notifyuser/:otherUserID': {
      name: 'send APNS push notification',
      summary: 'sends an Apple Push Notification Service ot the user specified by otherUserID',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          message: 'message to send to user specified by otherUserID'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'If the user specified by otherUserID does not accept notifications, and error is returned'
    },
    'GET /messages': {
      name: 'get notifications',
      summary: 'get all unacknowledged system notifications for callingUser',
      method: 'GET',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'PUT /messages/acknowledge/:messageID': {
      name: 'acknowledge message',
      summary: 'acknowledge message so it is not delivered again by GET /messages/:userID',
      method: 'PUT',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'PUT /locks/initiatecomm/:lockID': {
      name: 'initiate communication',
      summary: 'takes two random numbers then returns a packet to be sent to the lock and a URL to PUT the response',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          mRand1: 'random number generated by client',
          mRand2: 'random number generated by client'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          packet: 'hex-encoded stream to send to lock',
          url: 'URL to which the response must be delivered using the method specified in the method key',
          method: 'method to use to deliver the response from the lock.'
        }
      },
      note: 'The mobile device PUTs mRand1 and mRand2 to the endpoint and then sends the packet in the response to the lock. ' +
        'When the lock responds, the response is send to the url specified by URL using the method specified by method.  ' +
        'Returns an Invalid Argument error if checksum fails.'
    },
    'GET /locks/m2lkeyexchangepacket/:lockID': {
      name: 'Get a key mobile to lock key exchange packet',
      summary: 'Generates random numbers then returns a packet to be sent to the lock and a URL to PUT the response',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          packet: 'hex-encoded stream to send to lock',
          url: 'URL to which the response must be delivered using the method specified in the method key',
          method: 'method to use to deliver the response from the lock.'
        }
      },
      note: 'The mobile device PUTs mRand1 and mRand2 to the endpoint and then sends the packet in the response to the lock. ' +
        'When the lock responds, the response is send to the url specified by URL using the method specified by method.  ' +
        'Returns an Invalid Argument error if checksum fails.'
    },
    'PUT /locks/getlockrands/:lockID': {
      name: 'get lock rands',
      summary: 'takes the lock\'s response to the exchange key packet and returns lRand1 and lRand2',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          LockResponse: 'hex-encoded response that lock returned from exchange keys command'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          lRand1: 'lRand1 for use in session key',
          lRand2: 'lRand2 for use in session key'
        }
      },
      note: 'The mobile device PUTs the response from the exchange key command to this endpiont.  The service returns lRand1 and lRand2 for use in the session key'
    },
    'GET /updateurl': {
      name: 'updateurl',
      summary: 'returns the URL to which to connect for real-time updates',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          updateurl: 'url to which to connect'
        }
      },
      note: 'The real-time update protocol is documented elsewhere (Use the Source, Luke)'
    },
    'POST /validation/:idtype': {
      name: 'validationIdentifier',
      summary: 'sends a verification code to an identifier, if no identifier is specified in the body a code will be sent to the last identifier of idtype on file ',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          optional: {
            value: 'email address or phone number',
            smsHashString: 'SMS hash string used by SMS Retriever API on Android'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          value: 'email or phone number the verification is sent to',
        }
      },
      note: 'sends an verification code to an identifier, if none is specified last identifier of type idtype will be used.  idtype can be either phone or email'
    },
    'POST /validate/:idtype': {
      name: 'validateIdentifier',
      summary: 'claims a verification code sent to an identifier, if no identifier is specified in the body a code will be sent to the last identifier of idtype on file ',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            code: 'the verification code that was sent to the identifier'
          },
          optional: {
            oneof: {
              email: 'email address',
              phone: 'telephone number'
            }
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          id: 'id of the identifier associated with the user',
          value: 'the value of the idenitifer assciated witht he user',
          userId: 'id of the user the identifier has been assciated with'
        }
      },
      note: 'if no identifier is specified in the body last identifier of type idtype will be used to claim the code.  idtype can be either phone or email'
    },
    'POST /telemetry/logautounlockaction': {
      name: 'log auto unlock action',
      summary: 'logs auto unlock actions for debugging use',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          event: 'single-token string describing event',
          description: 'optional description of the event',
          date: 'integer milliseconds since epoch',
          LockID: 'ID of lock',
          UserID: 'ID of user'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'POST /bridges': {
      name: 'create bridge',
      summary: 'associate bridge and lock and returns a token to be used by the bridge',
      method: 'POST',
      request: {
        headers: standardRequestHeaders
      },
      required: {
        body: {
          mfgBridgeID: 'a unique manufacturer id',
          LockID: 'the lock to be associated with the bridge',
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          bridgeID: 'the identifier of the bridge to use in other request',
          bridgeAuthToken: 'the token to be used by the bridge to connect to the remote bridge server'
        }
      },
      permissions: ['bridgemgmt'],
      note: ''
    },
    'DELETE /bridges/:bridgeID': {
      name: 'delete a bridge',
      summary: 'delete a bridge lock association',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
      },
      permissions: ['bridgemgmt'],
      note: ''
    },
    'POST /bridges/:bridgeID/notifications/:type': {
      name: 'create bridge notification',
      summary: 'set up notification of type specified for bridge specified',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: 'array of notification channels'
      },
      response: {
        headers: standardRequestHeaders
      },
      note: 'Sets up notifications of type specified for the bridge specified for the calling user.  ' +
        'The only type currently supported is system, and the only channel supported is push.  ' +
        'If no body is specified, the channel will be push.'
    },
    'DELETE /bridges/:bridgeID/notifications/:type': {
      name: 'delete bridge notification',
      summary: 'disables bridge notification for type specified on specified bridge',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: standardResponseHeaders,
      note: 'Disables notification of type specified for the bridge specified for the calling user.  ' +
        'The only current type supported is system'
    },
    'GET /bridges/:bridgeID/notifications': {
      name: 'get bridge notifications',
      summary: 'returns a list of notifications for the bridge',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          type: 'notification type',
          channel: 'notification channel'
        }, {
          type: 'notification type 2',
          channel: 'notification channel 2'
        }]
      },
      note: 'returns an array of all notifications on the bridge for the calling user.'
    },
    'PUT /nest/authtoken/:token': {
      name: 'Nest Authorization Token',
      summary: 'associates the specified Nest authorization token with the calling user',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'creates the association if none exists, updates it if it does exist.'
    },
    'GET /nest/structures': {
      name: 'Get Nest Structures',
      summary: 'returns the Nest structures for the user if they have associated their August ID with ' +
        'their Nest ID',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          'structure ID': {
            name: 'name of structure',
            country_code: 'country code of structure',
            time_zone: 'time zone of structure',
            away: 'away status of structure',
            structure_id: 'structure ID'
          }
        }
      },
      note: 'There can be more than one structure ID in the response object (which is an Object, not an Array).'
    },
    'GET /appfeatures/:platform/:version': {
      name: 'Get enabled features',
      summary: 'Get enabled optional features for platform/version/callingUserID',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          'feature name': 'boolean',
          'other feature name': 'boolean',
          '...': '...'
        }
      },
      note: ''
    },
    'PUT /locks/geofenceinfo/:lockID': {
      name: 'Put GeoFence Info',
      summary: 'Put information about the calling user\'s choices on setting geofence for automatic unlock foir the given lockID and platform (iOS or Android)',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          deviceModel: 'string describing the device',
          movedCenter: 'boolean -- indicates the user moved the center of the geofence (required)',
          changedRadius: 'boolean -- indicates the user changed the radius from the default value (required)',
          newRadius: 'radius the user set if they changed it (Required if changedRadius is true)'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'GET /locks/firmware/:lockID/:version': {
      name: 'Get firmware update',
      summary: 'Check if there are any ARM updates available and return a new firmware blob if there is a new version available',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: 'Octet stream of the ARM firmware'
      },
      note: 'As of August 2015, this endpoint is deprecated, since it does not support TI firmware updates. ' +
        'All new code should use the endpoint GET /locks/:lockID/firmware/:version'
    },
    'GET /locks/:lockID/firmware/:version': {
      name: 'Check for firmware updates',
      summary: 'Check if any updates are needed for the ARM firwmare or the TI (Bluetooth) firmware.\n' +
        'The "version" string should be in the form of "${ARM_GITHASH}-${ARM_VERSION}-${TI_VERSION}".' +
        'If the ARM_VERSION is not defined, then use the string "undefined" in its place.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          updateInfo: [{
            chip: 'TI or ARM',
            version: 'Version of the firmware that should be installed on this lock'
          }]
        }
      },
      note: 'Examples of firmware version numbers:\n' +
        '  For the RC 4 firmware release, the version string would be "1b5bfedc-undefined-0.4.2"\n' +
        '  For the RC 5.1 firmware release, the version string would be "788113bb-undefined-0.4.2"\n' +
        '  For the RC 5.6 firmware release, the version string would be "403286da-undefined-1.0.0"\n' +
        '  For the 1.0.55 firmware release, the version string would be "d8df5ada-1.0.55-1.1.12"\n' +
        '  For the 1.0.75 firmware release, the version string would be "f98c98f9-1.0.75-1.1.18"'
    },
    'GET /locks/:lockID/firmware/:chip/:version': {
      name: 'Download firmware blob',
      summary: 'Gets the firmware update blob for the given chip. Individualizes this firmware update blob if necessary.\n' +
        'The "chip" string should be either "arm" or "ti".\n' +
        'The "version" string should be in the form of "${ARM_GITHASH}-${ARM_VERSION}-${TI_VERSION}".' +
        'If the ARM_VERSION is not defined, then use the string "undefined" in its place.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: 'Firmware blob with mimetype octet-stream for arm and x-gzip for ti'
      },
      note: ''
    },
    'GET /locks/:lockID/firmware': {
      name: 'Check for firmware updates',
      summary: 'Check for firmware updates for a lock version and its chips, which are specified as query parameters',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          chip: 'Chip abbreviation, for example `ti`, `sd`, etc. Since different lock versions have different ' +
          'chips, this parameter will be named differently depending on lock version. ' +
          'For example, for L3: sd=1.1.0&dlg=2.0.0',
          version: 'Chip version',
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          updateInfo: [{
            chip: 'Chip - for example `ti`, `sd`, `dlg`, `nordic`, etc.',
            version: 'Version of the firmware that should be installed on this lock'
          }]
        }
      },
      note: 'Status Codes:\n' +
      '200 OK\n' +
      '404 ResourceNotFound - lockID not found\n'
    },
    'PUT /locks/:lockID/firmware/keypadcheck': {
      name: 'Check lock has firmware to support keypad.',
      summary: 'This tells the client the lock has firmware supporting the keypad.',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          supported: 'boolean'
        }
      },
      note: 'Calling user must be a lock super user.'
    },
    'DELETE /locks/:lockID': {
      name: 'Delete Lock',
      summary: 'deletes a lock from the system (factory reset)',
      method: 'DELETE',
      query: {
        optional: {
          soft: 'number|string, 1 to leave the lock record and calling user intact, all other users and associations are removed'
        }
      },
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Removes lock from all associations in the system.\n' +
        '###Responses:\n' +
        'Code | Reason \n' +
        '---- | ------\n' +
        ' 403 | callingUser is not authorized to use lock\n' +
        ' 404 | lock not found\n',
      permissions: ['lockmgmt']
    },
    'DELETE /houses/houseID': {
      name: 'Delete House',
      summary: 'deletes a house from the system and removes all assocications of that house',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'returns 404 if house not found, 403 if callingUser does not own house',
      permissions: ['housemgmt']
    },
    'PUT /houses/:houseID': {
      name: 'Update House',
      summary: 'update a house',
      method: 'PUT',
      request: {
        body: {
          required: {
            HouseName: 'description: <Name of house (home, "crash pad", ...)',
          },
        },
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'returns 404 if house not found, 403 if callingUser is not owner of house'
    },
    'PUT /houses/adduser/:houseID/:otherUserID/:type': {
      name: 'Add house user',
      summary: 'Add a user with a type to a house',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Returns 404 if house not found, 403 if callingUser is not superuser of house'
    },
    'PUT /houses/:houseID/users/:otherUserID/setusertype/:type': {
      name: 'Update House User Type',
      summary: 'switch a user of a house between user and superuser',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'type is either [\'user\', \'superuser\'].  Returns a 404 if house not found.  Returns 403 if callingUser is not a superuser of the house.  Returns 412 if otherUser is not a user of the house'
    },
    'PUT /locks/status/:lockID': {
      name: 'Set lock status',
      summary: 'Updates the status of a lock in the locks collection.',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: ' Possible values \'locked,\' \'unlocked,\' \'unknown,\' \'not-advertising.\' The end point also publishes status messages and hits web hooks when applicable.'
    },
    'GET /keypads/firmware/:keypadID/:version': {
      name: 'Get firmware update',
      summary: 'Check if there are any version updates available and return a new firmware blob if there is a new version available',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: 'Octet stream of firmware'
      },
      note: 'Returns 204 and no body if keypad has proper version.'
    },
    'GET /keypads/:keypadID/firmware/:version': {
      name: 'Check firmware version',
      summary: 'Saves given version as current firmware version in db and returns new version if available.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          updateInfo: {
            version: 'Version of the new update firmware (semver).'
          }
        }
      },
      note: ''
    },
    'GET /keypads/:keypadID/code': {
      name: 'Get keypad reset code',
      method: 'GET',
      summary: 'Gets the reset code associate with that particular keypad.',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          resetCode: 'a 4 digit string'
        }
      },
      note: 'returns a 404 if the keypad serial number is not found, 403 if it is associated with a lock the user is not a superuser of'
    },
    'PUT /keypads/:keypadID/code': {
      name: 'Put keypad reset code',
      summary: 'Stores the resed code of the keypad, the reset code is retained accross lock disassociation',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          set: true
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'returns a 404 if the keypad SN is not found, 403 if there is a permission issue, 409 if the resetCode is not valid'
    },
    'GET /keypads/:keypadID/:lockID/offlinekey': {
      name: 'Setup handshake key',
      summary: 'Creates a handshake key and adds it to given lock\'s offline keys,',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          handshakeKey: 'Lock/keypad handshake key.',
          manufacturingHandshakeKey: 'Keypad/phone handshake key.',
          currentHandshakeKey: 'Keypad/phone handshake key.',
          nextHandshakeKey: 'Keypad/phone handshake key.'
        }
      },
      note: 'Calling user must be a lock super user.'
    },
    'POST /keypads': {
      name: 'create keypad lock association',
      summary: 'associate a keypad and a lock and returns the keypad id, the locks collection will be updated to reflect the association',
      method: 'POST',
      request: {
        headers: standardRequestHeaders
      },
      required: {
        body: {
          serialNumber: 'the unique serial number of the keypad',
          lockID: 'the lock to be associated with the keypad',
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          keypadID: 'the identifier of the keypad to use in other request'
        }
      },
      note: ''
    },
    'PUT /keypads/:keypadID/handshakeKey': {
      name: 'Update a keypad\'s currentHandshakeKey.',
      summary: 'This updates a keypad\'s currentHandshakeKey.',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            nextHandshakeKey: 'This is the nextHandshakeKey (generated from the same endpoint with a GET request) to replace the currentHandshakeKey.'
          }
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Calling user must be a lock super user.'
    },
    'DELETE /keypads/:keypadID': {
      name: 'deletes a keypad association',
      summary: 'deletes a keypad lock association and moves the its offline key to deleted',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Calling user must be a lock super user.'
    },
    'GET /apps/mine': {
      name: 'get apps',
      summary: 'gets a list of apps associated the callingUser',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          _id: 'ID of app',
          name: 'name of app',
          icon: 'URL to icon for app',
          description: 'description',
          type: 'type',
          disconnectURL: 'Oauth disconnect URL',
          infoURI: 'Oauth info URI',
          partnerID: 'ID of partner - maps to `_id` field in GET /partners response'
        }]
      },
      note: 'Response body is an array of connected apps.  If there are no apps, it is an array of length 0.'
    },
    'GET /partners': {
      name: 'get August Access partner offerings',
      summary: 'retrives a list of service offerings from partners that integrate with August',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          _id: 'ID of partner',
          name: 'name of partner',
          heroImageURL: 'URL to partner hero image',
          partnerURL: 'URL to partner homepage',
          logoURL: 'URL to partner logo',
          wordmarkURL: 'URL to partner wordmark',
          partnerTagline: 'partner tagline',
          jointTagline: 'tagline tailored to August',
          partnerDescription: 'company description',
          jointDescription: 'service offering description',
          promotion: 'available partnership promotions',
          locations: 'where the service is provided',
        }]
      },
      note: 'Only return partners of type `WORKS_WITH`'
    },
    'POST /partners/user': {
      name: 'Create August user per given partner user data',
      summary: 'Create August user/identifiers per given partner user data. Generates access token and (returns) auth code and stores in cache for verification when calling OAuth service.',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          userID: 'Partner user id',
          name: 'String containing both first and last name',
          email: 'Unverified email address'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          auth_code: 'Code for use with OAuth service'
        }
      },
      note: '',
      permissions: ['partnerusermgmt']
    },
    'PUT /partners/user': {
      name: 'Edit partner user data',
      summary: 'Gives partners ability to edit partner user\'s user_id, name and email.',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          userID: 'Partner user id',
          name: 'String containing both first and last name',
          email: 'Unverified email address'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'August user id obtained from access token',
    },
    'POST /partners/user/verify': {
      name: 'user verification and sign-up/sign-in',
      summary: 'follows a specific flow of user identifier verifications, optionally creates a new user, and eventually signs-in the user',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          type: 'identifier type, "email" or "phone"',
          value: 'user identifier value, an email address or phone number',
          code: 'optional verification code for a previously provided identifier',
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          auth_code: 'optional, oAuth authentication code is returned when the flow is completed successfully and indicates a signed-in user',
        },
      },
      note: ''
    },
    'POST /partners/verify': {
      name: 'verify user account exists',
      summary: 'Allows a partner to test whether a user with given identifiers exists. ' +
        'Responds with 200 if the user exists, 404 if not',
      note: 'We chose POST over GET so that we can have the partner provide an encrypted body payload',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          email: 'email address',
          phone: 'phone number, starting with +, followed by international country code, followed by phone number, numbers only'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      permissions: ['partnerusermgmt'],
    },
    'GET /partners/tags': {
      name: 'Get August Access partner IDs grouped by tag name',
      summary: 'Retrives a list of tags and the partner IDs that have those tags',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          tag: 'Tag Name',
          appItems: [
            'ID of first partner partner with this tag',
            'ID of second partner partner with this tag'
          ]
        }]
      },
      note: ''
    },
    'GET /partners/oauthurl': {
      name: 'Get an OAuth URL to use with 3rd party APIs',
      summary: 'Get an OAuth URL to use with 3rd party APIs',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          partnerID: 'string ID of partner',
          platform: 'string, \'ios\' or \'android\'',
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          url: 'string in OAuth 2.0 format:  containts a base url a stringified query args [client_id, redirect_uri, and state]'
        }
      },
      note: 'partner information must be in the db and retrievable by partner_id or a 404 is returned.  unexpected platform gives a 4xx response.\n' +
      'state information is tied to the user ID, platform, and partnerID. That value persists for 5 minutes'
    },
    'POST /partners/:partnerID/mailinglist': {
      name: 'Add an email to a partner mailing list.',
      summary: 'Adds a given email to a partner mailing list.',
      method: 'POST',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'GET /partners/:partnerID/mailinglist': {
      name: 'Fetch a partner mailing list.',
      summary: 'Returns an array of emails of a partner mailing list.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          partner: 'partner information',
          emails: 'array of email addresses'
        }]
      },
      note: ''
    },
    'GET /airbnb/listings': {
      name: 'Fetch Airbnb listings along with lock associations',
      summary: 'Returns an array of stripped down listing objects with lock associations',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          id: 'airbnb id of listing',
          name: 'display name of listing',
          locks: 'array of lock IDs associated with this listing',
          access: [{
            appAccess: 'boolean for do we allow app access for this listing',
            keypadAccess: 'boolean for do we allow keypad access for this listing',
            lockID: 'a lock ID that appears in the locks array'
          }]
        }],
      },
      note: ''
    },
    'PUT /airbnb/listings/:listingID/locks/:lockID': {
      name: 'Associate a lock with an Airbnb listing',
      summary: 'pairs a lock and listing based on given parameter ids',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          keypadAccess: 'flag indicating if guests should have access via august keypad',
          appAccess: 'flag indicating if guests should have access via august app'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'DELETE /airbnb/listings/:listingID/locks/:lockID': {
      name: 'Disassociate a lock with an Airbnb listing',
      summary: 'de-pairs a lock and listing based on given parameter ids',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'POST /airbnb/authtoken': {
      name: 'Airbnb Authorization Token',
      summary: 'associates the specified Airbnb authorization token with the calling user',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        /* Example from Airbnb API docs https://www.airbnb.com/developer/docs/oauth/ */
        body: {
          'access_token': 'Airbnb access token of user',
          'expires_at': 'Epoch timestamp',
          'refresh_token': 'Airbnb refresh token',
          'user_id': 'Airbnb user id'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'creates the association if none exists, updates it if it does exist.'
    },
    'DELETE /airbnb': {
      name: 'Remove Airbnb credentials',
      summary: 'Removes Airbnb credentials for calling user',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'DELETE /apps/:appID': {
      name: 'disconnect app',
      method: 'DELETE',
      summary: 'disconnects August App from app specified by appID for callingUser',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'if callingUser is not associated with the app specified, no error is returned'
    },
    'DELETE /users/tokens/:appID': {
      permissions: [],
      name: 'Delete token',
      summary: 'Delete token for a given app',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: ''
    },
    'GET /users/tokens/:appID': {
      permissions: [],
      name: 'Get or generate a token',
      summary: 'Get or generate a token for a given app',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'Current use: The subscription management web UI needs to retrieve ' +
        'some subscriptions related data. We do not want to have that web app ' +
        'access REST API directly. august-subscription-server has been created to ' +
        'provide the required data. To authenticate against ' +
        'august-subscription-server a temporary (30min) token will be used by ' +
        'the web app. The mobile clients will provide that token to the web app ' +
        'after requesting it from REST API.'
    },
    'GET /augustappversionok/:clientos/:clientversion': {
      permissions: [],
      name: 'Check app version',
      summary: 'Checks whether the application needs an compulsary upgrade',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: ''
    },
    'POST /clientlogdata': {
      permissions: [],
      name: 'Post client log data',
      summary: 'Post client log data',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: ''
    },
    'POST /logrequesttime': {
      name: 'record request and response time of a particular API call',
      summary: 'stores the specifice client serial ID, request time, and response time',
      method: 'POST',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'PUT /private/locks/status/:lockID': {
      permissions: ['private'],
      name: 'Set lock status',
      summary: 'Updates the status of a lock in the locks collection. Possible values \'locked,\' \'unlocked,\' \'unknown.\'',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: ''
    },
    'GET /private/locks/status/:lockID': {
      permissions: ['private'],
      name: 'Get lock status',
      summary: 'Gets status of lock',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: ''
    },
    'POST /private/locks/log/:lockID/:action': {
      permissions: ['private'],
      name: 'Create log entry',
      summary: 'Creates a log entry per given post data; special handling for manual operation. Notifies listeners and issues push notifications to applicable parties.',
      method: 'POST',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'DELETE /doorbells/:doorbellID/:otherUserID': { // path
      name: 'Remove User From Doorbell',
      summary: 'Deletes user specified by otherUserID from doorbell specified by doorbellID',
      method: 'delete',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Returns Unauthorized if the calling user is not a user of the doorbell.' +
        'Returns Not Found if doorbell or otherUserID do not exist.' +
        'Returns PreconditionFailed if otherUserID is not a user of the doorbell'
    },
    'DELETE /doorbells/:doorbellID': {
      name: 'Delete Doorbell',
      summary: 'Deletes a doorbell',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'This will return a 404 if doorbellID does not exist and a NotAuthorizedError if user is not a user of the doorbell'
    },
    'DELETE /doorbells/:doorbellID/images': {
      name: 'Delete Doorbell Images',
      summary: 'Remove all Doorbell Images',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'This will return a 404 if doorbellID does not exist and a NotAuthorizedError if user is not a user of the doorbell'
    },
    'DELETE /doorbells/:doorbellID/lock/:lockID': {
      name: 'Delete Doorbell/Lock Connection',
      summary: 'Deletes a connection between a doorbell and a lock',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'This will return a 404 if doorbellID/lockID does not exist and a NotAuthorizedError if user is not a user of the doorbell'
    },
    'PUT /doorbells/:doorbellID/settings/user': {
      name: 'Update Doorbell/User Settings',
      summary: 'Update Doorbell/User Settings',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          motion_notifications: 'Boolean',
          buttonpush_notifications: 'Boolean',
          notify_when_offline: 'Boolean',
          etc: 'etc'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Must put the whole settings object.  Cannot update individual field'
    },
    'PUT /doorbells/:doorbellID/users': {
      name: 'Add Doorbell Users',
      summary: 'Add doorbell users',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          users: ['Array of user identifiers']
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Returns 404 if doorbell is not found.  Returns Not Authorized if calling user is not a user of the doorbell'
    },
    'PUT /doorbells/:doorbellID/settings/doorbell': {
      name: 'Update Doorbell Settings',
      summary: 'Update Doorbell Settings using presets or custom body with settings',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          powerProfilePreset: '[optional] override settings: \n' +
            '[pirSensitivity, videoResolution, nightModeAlsThreshold, irLedBrightness] with ' +
            'presets.  If passed, must be a valid value. \n' +
            'The only valid value for this is the integer 0 and -1 (which custom and will be ignored)',
          setting1: 'type of setting 1',
          etc: 'type of etc'
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Can update individual field \n' +
        'status code 409 if powerProfilePreset is an invalid preset'
    },
    'PUT /doorbells/:doorbellID/lock/:lockID': {
      name: 'Creates Doorbell/Lock Connection',
      summary: 'Creates a connection between a doorbell and a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'This will return a 404 if doorbellID/lockID does not exist and a NotAuthorizedError if user is not a user of the doorbell'
    },
    'GET /doorbells/:doorbellID/videoevent': {
      name: 'Retrieve dvr video URL and video expiration',
      summary: 'Gets a temporary viewable URL for archived video',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          dvrID: 'string'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          url: 'string',
          videoExpiresAt: 'number'
        }
      },
      note: 'returns UnauthorizedError if the user is not of that doorbell.  Returns 404 if m3u file is not found.  Returns 401 if no DVR subscription is found.  Returns 404 if video is unavailable in activity log'
    },
    'GET /doorbells/:doorbellID/videoevent/:eventID': {
      name: 'Retrieve dvr video URL and video expiration',
      summary: 'Gets a temporary viewable URL for archived video',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          url: 'string',
          videoExpiresAt: 'number'
        }
      },
      note: ' This endpoint is the same (has the same middleware) as GET /doorbells/:doorbellID/videoevent except it uses activitylog Object ID instead of dvrID when querying the database.'
    },
    'GET /doorbells/:doorbellID/rtsp_url': {
      name: 'Retrieve rtsp proxy information for a doorbell',
      summary: 'Gets proxy information for Alexa to view a stream',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          proxyIP: 'string',
          session: 'string',
          deviceIP: 'string'
        }
      },
      note: 'returns UnauthorizedError if the user is not of that doorbell.  Endpoint responds in 5 seconds or times out'
    },
    'GET /doorbells/:doorbellID/video/:dvrID': {
      name: 'Retrieve dvr video URL',
      summary: 'Gets a temporary viewable URL for a downloadable video',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          fields: 'string'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          transactionID: 'string'
        }
      },
      note: 'Returns a 202 if no errors are thrown.  Returns UnauthorizedError if the user is not of that doorbell or if the doorbell does not have a DVR subscription.  Returns 404 if the doorbellID or dvrID do not exist.'
    },
    'GET /doorbells/:doorbellID/calls/:callID/image': {
      name: 'Retrieve callID image',
      summary: 'Returns the snapshot associated with a doorbell call',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          imageUrl: 'string'
        }
      },
      note: 'returns UnauthorizedError if the video does not belong to that doorbell or if the user is not of that doorbell'
    },
    'GET /ivservers': {
      name: '(TEMPORARY) get iv server info',
      summary: '(TEMPORARY)',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'does a redirect'
    },
    'POST /doorbells/:houseID': {
      name: 'Add Doorbell',
      summary: 'Adds a doorbell to a house.',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            serialNumber: 'serialNumber of the doorbell',
            name: 'name of the doorbell',
            type: 'string.  doorbell type'
          },
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          doorbellID: 'unique ID of doorbell, the client will use this ID for all subsequent transactions',
        },
      },

      note: 'the pin returned might be different than the one requested if it was already used.'
    },
    'POST /doorbells/:doorbellID/videoevent/share': {
      name: 'Share With August',
      summary: 'Shares a DVR Video With August Marketing',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            description: 'string',
            dvrID: 'string',
          },
        },
      },
      response: {
        headers: standardResponseHeaders
      },

      note: 'Returns 404 if HLS video stream is unavailable'
    },
    'POST /doorbells/:doorbellID/avsession/:action': {
      name: 'Doorbell AV Session Actions',
      summary: 'Application hits this endpoint when they want to join, leave, or heartbeat for an AV Session related to a doorbell press or IR sensor.',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {}
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          status: {
            videoAvailable: 'boolean',
            started: 'int',
            callID: 'string',
            dvrID: 'string',
            '<userID1>': 'array of objects.  objects are keyed by action (join or leave) and value is a number of when they did it',
            numUsersOnCall: 'int',
            initiated_user: 'string if a user started the call',
            answered_user: 'string if a call was started by the doorbell',
            image: 'object if image has been uploaded already'
          },
          join: {
            started: 'int',
            callID: 'string',
            dvrID: 'string',
            '<userID1>': 'array of objects.  objects are keyed by action (join or leave) and value is a number of when they did it',
            numUsersOnCall: 'int',
            initiated_user: 'string if a user started the call',
            answered_user: 'string if a call was started by the doorbell',
            image: 'object if image has been uploaded already'
          },
          leave: {
            started: 'int',
            callID: 'string',
            dvrID: 'string',
            '<userID1>': 'array of objects.  objects are keyed by action (join or leave) and value is a number of when they did it',
            numUsersOnCall: 'int',
            initiated_user: 'string if a user started the call',
            answered_user: 'string if a call was started by the doorbell',
            image: 'object if image has been uploaded already'
          },
          heartbeat: {
            started: 'int',
            callID: 'string',
            dvrID: 'string',
            '<userID1>': 'array of objects.  objects are keyed by action (join or leave) and value is a number of when they did it',
            numUsersOnCall: 'int',
            initiated_user: 'string if a user started the call',
            answered_user: 'string if a call was started by the doorbell',
            image: 'object if image has been uploaded already'
          },
        },
      },
      note: 'Valid actions are [\'heartbeat\' \'join\', \'leave\', \'status\'].' +
        'Only 1 user is allowed to respond to the doorbell press.  Otherwise a ConflictError (409) is sent back.' +
        'When a user responds a pubnub message is sent to the other listeners to disable their response capability on the client.' +
        'In the event that this API is not called with a hangup or heartbeat (client power or connection failure) the call will be ended when the key expires' +
        'When a call is hung up, an object called callStats is expected in the request body.' +
        'videoAvailable flag is only present for \'respond\''
    },
    'POST /doorbells/:doorbellID/event/:eventType': {
      name: 'Doorbell Press',
      summary: 'Generates a pubnub message when a doorbell is pressed or motion is detected.  An image is taken from the camera and sent in another pubnub message to the doorbell user',
      method: 'POST',
      request: {
        headers: imageRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'THIS FUNCTION WAS MOVED TO THE MARS API SERVER.  POSTing to /doorbells/:doorbellID/event/:eventType will upload the image taken from the camera in the body and send the url of the image in the pubnub message ' +
        'image for the other user.  eventType is either \'presence\' or \'buttonpush\'.  doorbellID is also required in params'
    },
    'PUT /doorbells/:doorbellID/adduser/:otherUserID': {
      name: 'Add a user to a doorbell',
      summary: 'adds a user to a doorbell',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'If the doorbell or other user doesn\'t exist return ResourceNotFound error.  If calling user is not a user of the doorbell return NotAuthorizedError'
    },
    'PUT /doorbells/:doorbellID/reboot': {
      name: 'Reboot a doorbell',
      summary: 'Publishes a message so the doorbell knows to reboot',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'If the doorbell or other user doesn\'t exist return ResourceNotFound error.  If calling user is not a user of the doorbell return NotAuthorizedError'
    },
    'PUT /doorbells/:doorbellID/wakeup': {
      name: 'Reboot a doorbell',
      summary: 'Publishes a message so the doorbell knows to wakeup',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'If the doorbell or other user doesn\'t exist return ResourceNotFound error.  If calling user is not a user of the doorbell return NotAuthorizedError'
    },
    'POST /doorbells/:doorbellID/log': {
      name: 'Write a log about a doorbell',
      summary: 'Writes to the logs',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: '[{key: val}] OR {key: val}]'
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'If the doorbell or other user doesn\'t exist return ResourceNotFound error.' +
        'If calling user is not a user of the doorbell return NotAuthorizedError.' +
        'Takes an array of log objects or a log object in the body of the request.'
    },
    'POST /unverifiedusers': {
      name: 'Creates unverified users',
      summary: 'Creates an unverified user with lock and credential types',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            lockID: 'the lock this user is associated with',
          },
          optional: {
            firstName: 'first name',
            lastName: 'last name',
            phone: 'phone number (E.164 spec)',
            credentialType: 'the credential type (string: pin, rf, finger)'
          }
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          id: 'the id of the unverified user',
          firstName: 'the firstName passed as a param',
          lastName: 'the lastName passed as params',
          slot: 'slot is only returned for specific lock types',
          pin: 'the pin for this user'
        }
      },
      note: 'If the credentialType is null we can treat it as pin.' +
      'Only the credentialType is pin/null, the response.body will contain pin.'
    },
    'PUT /unverifiedusers/:unverifiedUserID': {
      name: 'Update unverified users',
      summary: 'Updates an unverified user associated with a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            lockID: 'the id of the lock associated with the unverified user'
          },
          optional: {
            firstName: 'the first name of the unverified user to update',
            lastName: 'the last name of the unverified user to update'
          }
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      body: {
        message: 'success'
      },
      note: ''
    },
    'DELETE /locks/:lockID/pin/:pin': {
      name: 'delete reserved pin',
      summary: 'deletes a reserved pin',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'the call will be successful, if the pin had already been expired or doesn\'t exists'
    },
    'DELETE /locks/:lockID/pins': {
      name: 'delete all pins associated with a lock',
      summary: 'This deletes all pins associated with a lock.',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'DELETE /locks/:lockID/credentials': {
      name: 'delete all pins/slots associated with a lock by type',
      summary: 'This deletes all pins/slots associated with a lock by type.',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
        query: {
          required: {
            type: 'string: pin, rf, finger'
          }
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'this is a replacement/update for \'DEL /locks/:lockID/pins\''
    },

    'DELETE /locks/:lockID/users/:otherUserID/credential': {
      name: 'delete pin/slot reserved for a lock by otherUserID, type',
      summary: 'This deletes a pin/slot reserved for a lock by otherUserID, type.',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
        query: {
          optional: {
            type: 'string: pin, rf, finger',
          }
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'If there is no type, the end point will release the cache about all credential types for the user.' +
      'The cache for the specified type will be deleted if there is a type for the user'
    },

    'GET /locks/:lockID/homekitkey': {
      name: 'Returns homekit key',
      summary: 'Returns homekit key for given lock and calling user.',
      method: 'GET',
      request: {},
      response: {
        status: 410,
      },
      // eslint-disable-next-line no-useless-escape
      note: '/!\ DEPRECATED: 410 GoneError'
    },
    'PUT /locks/:lockID/users/:otherUserID/pin': {
      name: 'Creates a or changes pin for user and lock',
      summary: 'Creates or change the pin on the specified lock for the specified user',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            pin: 'the pin',
            state: 'the state of the pin, which can be \'created\',\'loaded\',\'deleted\',\'disabling\',\'disabled\'',
            firstName: 'the firstName of the user, optional',
            lastName: 'the lastName of the user, optional',
            accessType: 'string: the type of the pin: always, recurring, temporary, oneTime',
            accessTimes: 'string: this field only required for access types recurring & temporary; for recurring access type possible values are "STARTSEC=<sec from start of day>[;ENDSEC=<sec from start of day>]"; if timezone of lock is known this is also valid: "DTSTART=<ISO date in UTC>[;DTEND=<ISO date in UTC>]" (end date optional, if not provided is set to 1 hour from start date). For temporary times must be ISO date in UTC. Not required when schedule is provided.',
            accessRecurrence: 'string: only required for access type recurring. See recurrence rules under RFC2445, e.g.: "FREQ=MONTHLY;BYMONTHDAY=10,15;COUNT=20". Not required when schedule is provided.',
            schedule: 'string: iCal data format following RFC5545 (https://tools.ietf.org/html/rfc5545) required for access types recurring & temporary; when accessTimes & accessRecurrence are provided, data of schedule overrides their values.'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'created: means that the PIN should be loaded onto the lock, first step of associating a pin ' +
        'loaded: means that the PIN has been loaded to the lock, second and final step of associating a pin ' +
        'deleting: means that the PIN should be deleted, first step of removing a pin from a lock ' +
        'deleted: means that the PIN has been be deleted from the lock ' +
        'disabling: means the the PIN should be disabled ' +
        'disabled: means that the PIN has been marked as disabled on the lock ' +
        'enabling: means that the PIN should be enabled ' +
        'enabled: means that the PIN has been enabled, which means that it is back in the loaed group of PINs. ' +
        'The PIN is only necessary when creating it'
    },
    'PUT /locks/:lockID/users/:otherUserID/credentials': {
      name: 'Creates a or changes pin/rf/finger for user and lock',
      summary: 'Creates or change the pin/rf/finger on the specified lock for the specified user',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            type: 'string: pin, rf, finger',
            pin: 'the pin',
            action: 'the action of operation, which can be \'intent\', \'commit\'',
            state: 'the state of the pin/rf/finger, which can be \'load\',\'enable\',\'disable\',\'delate\',\'update\'',
          },
          optional: {
            slot: 'the slot',
            firstName: 'the firstName of the user',
            lastName: 'the lastName of the user',
            accessType: 'string: the type of the pin/rf/finger: \'always\', \'recurring\', \'temporary\', \'oneTime\', the default value is \'always\'',
            accessTimes: 'string: this field only required for access types recurring & temporary; for recurring access type possible values are "STARTSEC=<sec from start of day>[;ENDSEC=<sec from start of day>]"; if timezone of lock is known this is also valid: "DTSTART=<ISO date in UTC>[;DTEND=<ISO date in UTC>]" (end date optional, if not provided is set to 1 hour from start date). For temporary times must be ISO date in UTC. Not required when schedule is provided.',
            accessRecurrence: 'string: only required for access type recurring. See recurrence rules under RFC2445, e.g.: "FREQ=MONTHLY;BYMONTHDAY=10,15;COUNT=20". Not required when schedule is provided.',
            schedule: 'string: iCal data format following RFC5545 (https://tools.ietf.org/html/rfc5545) required for access types recurring & temporary; when accessTimes & accessRecurrence are provided, data of schedule overrides their values.'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          created: 'array of the unique lock & user which state is created',
          loaded: 'array of the unique lock & user which state is loaded',
          disabled: 'array of the unique lock & user which state is disabled',
          disabling: 'array of the unique lock & user which state is disabling',
          enabling: 'array of the unique lock & user which state is enabling',
          deleting: 'array of the unique lock & user which state is deleting',
          updating: 'array of the unique lock & user which state is updating',
        }
      },
      note: 'created: means that the PIN should be loaded onto the lock, first step of associating a pin ' +
        'loaded: means that the PIN has been loaded to the lock, second and final step of associating a pin ' +
        'deleting: means that the PIN should be deleted, first step of removing a pin from a lock ' +
        'deleted: means that the PIN has been be deleted from the lock ' +
        'disabling: means the the PIN should be disabled ' +
        'disabled: means that the PIN has been marked as disabled on the lock ' +
        'enabling: means that the PIN should be enabled ' +
        'enabled: means that the PIN has been enabled, which means that it is back in the loaed group of PINs. ' +
        'The \'pin\' is only necessary when type euqals pin & create it. ' +
        'this is going to replace \'PUT /locks/:lockID/users/:otherUserID/pin\''
    },
    'PUT /private/locks/timeadjustment/:lockID/:realtime/:locktime': {
      permissions: ['private'],
      name: 'Time Adjustment',
      summary: 'Inform server of time adjustment for a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'When a mobile device detects the clock on the lock is out of sync, it sets the time and informs the ' +
        'server of the adjustment.  Returns authorization error if callingUser is not able to use lock.  ' +
        'Returns success otherwise.'
    },
    'GET /nest/cameras': {
      name: 'get Nest cameras',
      summary: 'returns all nest cameras that can be associated with a lock',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: 'array of nest camera objects',
      note: ''
    },
    'POST /nest/camera': {
      name: 'add a Nest camera',
      summary: 'adds a nest camera to the system and associates it with the house represented by the camera\'s Nest structure',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            name: 'name field returned in response to GET /nest/cameras',
            device_id: 'device_id returned in response to GET /nest/cameras',
            structure_id: 'structure_id returned in response to GET /nest/cameras',
            name_long: 'name_long returned in response to GET /nest/cameras',
            web_url: 'web_url returned in response to GET /nest/cameras',
            app_url: 'app_url returned in response to GET /nest/cameras'
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          CameraID: 'August ID of camera'
        }
      },
      note: 'The camera ID in the response is the id to be used in all other August camera-related APIs. ' +
        'This is is NOT the Nest camera ID'
    },
    'PUT /locks/:lockID/cameras/:cameraID': {
      name: 'Associate Nest camera and lock',
      summary: 'Associates camera specified by cameraID with lock specified by lockID.',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'A camera can be associated with multiple locks, but those locks must be in the same house'
    },
    'DELETE /locks/:lockID/cameras/:cameraID': {
      name: 'Disassociate Nest camera and lock',
      summary: 'Disassociates camera specified by cameraID from lock specified by lockID',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Does not disassociate the camera from the house'
    },
    'PUT /doorbells/:doorbellID/cameras/:cameraID': {
      name: 'Associate Nest camera and doorbell',
      summary: 'Associates camera specified by cameraID with doorbell specified by doorbellID.',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'A camera can be associated with multiple doorbells, but those doorbells must be in the same house'
    },
    'DELETE /doorbells/:doorbellID/cameras/:cameraID': {
      name: 'Disassociate Nest camera and doorbell',
      summary: 'Disassociates camera specified by cameraID from doorbell specified by doorbellID',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Does not disassociate the camera from the house'
    },
    'POST /locks/cameras/:lockID/:cameraID': {
      name: 'associate lock with camera',
      summary: 'Associates camera specified by cameraID with a lock specified by lockID',
      method: 'POST',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'A camera can be associated with multiple locks, but those locks must be in the same house'
    },
    'DELETE /cameras/:cameraID': {
      name: 'delete camera',
      summary: 'deletes camera specified by cameraID and removes its association with house and locks',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'DELETE /locks/cameras/:lockID/:cameraID': {
      name: 'disassociate camera from lock',
      summary: 'Disassociates camera specified by cameraID from lock specified by lockID',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'does not disassociate the camera from the house'
    },
    'PUT /locks/:lockID/timezone': {
      name: 'Set the timezone on lock',
      summary: 'Returns the timezones hour offset from UTC',
      note: '',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          zone: 'timezone string e.g. America/Los_Angeles',
          time: 'optional parameter to manually set the time to convert'
        }
      },
      response: {
        body: {
          timeZoneOffsetInitial: 'timezone offset measured in 15 minute intervals'
        }
      }
    },
    'PUT /doorbells/:doorbellID': {
      name: 'Update doorbell information',
      summary: 'Updates doorbell fields that are whitelisted',
      note: 'Currently, only the name field is whitelisted',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      }
    },
    'GET /doorbells/:doorbellID/avsession/token': {
      name: 'Get doorbell intellivision session token',
      summary: 'Returns token information given a doorbell id',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: {
          customerID: 'customer id',
          session: 'session token',
          expiresAt: 'unix timestamp when redis key expires'
        }
      }
    },
    'GET /subscriptions/plans': {
      name: 'List subscription plans',
      summary: 'Returns subscription plan details',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: [{
          planID: 'internal database object ID',
          planCode: 'plan code',
          name: 'plan name',
          description: 'more detailed description',
          createdAt: 'date when the plan was created',
          updatedAt: 'date when the plan was last updated',
          planIntervalLength: 'number of days or months for the length of the plan',
          planIntervalUnit: 'months, days, ...',
          currencies: [{
            currencyCode: 'currency short code',
            unitAmountInCents: 'plan price in the currency\'s one-hundredth subdivision unit',
            setupFeeInCents: 'setup fee in the currency\'s one-hundredth subdivision unit'
          }]
        }]
      }
    },
    'GET /subscriptions/plans/:planID': {
      name: 'show single subscription plan',
      summary: 'Returns subscription plan details for a single plan',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: {
          planID: 'internal database object ID',
          planCode: 'plan code',
          name: 'plan name',
          description: 'more detailed description',
          createdAt: 'date when the plan was created',
          updatedAt: 'date when the plan was last updated',
          planIntervalLength: 'number of days or months for the length of the plan',
          planIntervalUnit: 'months, days, ...',
          currencies: [{
            currencyCode: 'currency short code',
            unitAmountInCents: 'plan price in the currency\'s one-hundredth subdivision unit',
            setupFeeInCents: 'setup fee in the currency\'s one-hundredth subdivision unit'
          }]
        }
      }
    },
    'GET /subscriptions': {
      name: 'GET subscriptions',
      summary: 'Returns subscriptions the calling user has access to',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: [{
          subscriptionID: 'subscription ID',
          userID: 'subscription manager user ID',
          type: 'type of subscription',
          status: 'trial/paid/invalid',
          deviceType: 'device',
          deviceID: 'device ID'
        }]
      },
      note: 'Returns device-level subscription.' +
        'accepts GET parameters deviceType and deviceID to filter for a specific subscription'
    },
    'GET /subscriptions/:subscriptionID': {
      name: 'GET a single subscription by ID',
      summary: 'Return a subscription object',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: {
          subscriptionID: 'subscription ID',
          userID: 'subscription manager user ID',
          type: 'type of subscription',
          status: 'trial/paid/invalid',
          deviceType: 'device',
          deviceID: 'device ID'
        }
      }
    },
    'DELETE /subscriptions/:subscriptionID': {
      name: 'Cancel a single subscription by ID',
      summary: 'Cancels a subscription',
      note: 'Can be used with any type of subscription, trial or paid',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      }
    },
    'PUT /subscriptions/:subscriptionID/enable': {
      name: 'Enable a single subscription by ID',
      summary: 'Allows to re-enable a subscription',
      note: 'Can be used with any type of subscription, trial or paid. Subscription must exist already.',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      }
    },
    'PUT /nock/add/:scopeID': {
      name: 'Add a ruleset to nock',
      summary: 'Used to add a ruleset to nock',
      note: '',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          hostString: 'A nock style host string, i.e., https://api.august.com',
          functions: [{
            name: 'The name of the nock method to call',
            arguments: 'An array of arguments to pass to the method'
          }]
        }
      },
      response: {
        headers: standardResponseHeaders
      }
    },
    'GET /nock/cleanAll': {
      name: 'Nock cleanAll method',
      summary: 'Removes all nock rules',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      }
    },
    'GET /nock/pendingMocks/:scopeID': {
      name: 'Nock pendingMocks method',
      summary: 'Returns any mocks that have not been used',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          mocks: 'An array of mocks not used'
        }
      }
    },
    'GET /nock/isDone/:scopeID': {
      name: 'Nock isDone method',
      summary: 'Returns a boolean indicating whether all of the mocks have been used',
      note: '',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          isDone: 'Boolean indicating if all mocks have been used'
        }
      }
    },
    'POST /nock/simulate': {
      name: 'Performs specified HTTP request',
      summary: 'Runs a HTTP request from the server which may or may not use nock',
      note: '',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          hostString: 'The nock style host string',
          path: 'The path to call',
          method: 'The HTTP method to use, i.e., GET, POST, etc.'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: 'The response from either the server or nock to the request'
      }
    },
    'GET /homeaccess/lockeligibility': {
      name: 'Get locks for August Access',
      summary: 'Get list of calling user\'s locks, their eligibility, and missing devices for August Access',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [ // array of objects describing the locks' eligibility
          {
            lockID: 'lock ID',
            lockName: 'name of lock',
            houseID: 'ID of house to which lock belongs',
            houseName: 'Name of house to which lock belongs',
            isEligible: 'boolean',
            accessories: 'map of devices -> true/false for available/not available; devices: bridge, doorbell, indoorCamera, keypad'
          },
        ],
      },
      note: 'Returns an empty body if the calling user has no eligible locks',
    },
    'GET /homeaccess/locks': {
      // takes a query parameter "accessGrantees" of comma-separated IDs: GET /homeaccess/locks?accessGrantees=granteeID1,granteeID2,...
      name: 'Get locks compliant with August Access requirements',
      summary: 'Called by August Access seller/retailer partners with a parameter list of shippers/home accessing partner/access grantees to get a list of locks that match each grantees requirements (remote access/PIN)',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          grantees: {
            granteeID1: ['lockID1', 'lockID2'],
            granteeID2: ['lockID1', 'lockID3'],
          },
          locks: {
            lockID1: {
              lockName: 'foo lock',
              houseName: 'foo house',
            },
            lockID2: {
              // ...
            },
            // ...
          },
        },
      },
      permissions: ['homeAccessSeller'],
      note: '',
    },
    'PUT /homeaccess/user/legal': {
      name: 'August access terms of service agreement',
      summary: 'Accepts August access terms of service agreement(aaTos) for a user',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          approved: 'boolean: true or false'
        },
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'This will only approve home access legal docs like aaTos'
    },
    'PUT /homeaccess/lock/:lockID': {
      name: 'Toggle a lock\'s home access delivery property',
      summary: 'Allows one to set the delivery property of a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          deliveryAllowed: 'boolean: true or false'
        },
      },
      response: {
        headers: standardResponseHeaders
      },
      note: ''
    },
    'GET /homeaccess/delivery/:houseId/:deliveryId': {
      name: 'Get a single delivery',
      summary: 'Gets a single delivery using a provided deliveryId for a house',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          deliveryId: 'delivery id',
          type: 'Enum("IN_HOME", "STANDARD")',
          status: 'current status of the delivery',
          deliveryWindow: 'delivery eta (iCal)',
          accessPartner: {
            name: 'partner name',
            imageUrl: 'partners image url'
          },
          courier: {
            name: 'courier name',
            imageUrl: 'courier image url'
          },
          instructions: 'delivery instructions (limited to 256 characters)'
        },
      },
      note: ''
    },
    'POST /homeaccess/token/:lockID': {
      name: 'Lets a seller partner create a home-access-token for a delivery partner',
      summary: 'Called by August Access seller partners with a lock ID to create a home-access-token for a shipping partner',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          orderID: 'Order identifier from Retailer',
          trackingID: 'Visit identifier from Access Grantee',
          accessGranteeID: 'August-assigned identifier of Access Grantee',
          accessDateRange: 'iCal format DTSTART; DTEND'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          homeAccessToken: 'opaque string'
        },
      },
      permissions: ['homeAccessSeller'],
      note: '',
    },
    'GET /homeaccess/partners/access': {
      name: 'Lets a seller partner list delivery providers',
      summary: 'Called by August Access seller partners to list August Access delivery providers',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        body: {
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          deliveryProviderID: 'The ID of the delivery provider',
          name: 'Delivery provider\'s name',
          logoURL: 'Delivery providers\'s logo URL',
          providerURL: 'Delivery providers\'s URL'
        }],
      },
      permissions: [], // TODO - do we need permissions on this endpoint?
      note: '',
    },
    'PUT /homeaccess/access/:command': {
      name: 'Lets an access partner remote operate a lock',
      summary: 'Called by August Access access partners with a Home-Access-Token to unlock/lock a lock',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      permissions: ['homeAccessAccess'],
      note: 'command can be [lock|unlock]',
    },
    'GET /homeaccess/access/status': {
      name: 'Lets an access partner remote check a lock\'s status',
      summary: 'Called by August Access access partners with a Home-Access-Token to get its status',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      permissions: ['homeAccessAccess'],
      note: '',
    },
    'GET /homeaccess/deliveries/:window': {
      name: 'Lets a client list upcoming or past deliveries',
      summary: 'Called by the mobile app to list upcoming or past deliveries for an August Access user',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: [
          {
            sellerPartnerID: 'Seller partner ID',
            accessPartnerID: 'Access partner ID',
            lockID: 'Lock ID',
            userID: 'User ID of the user receiving the delivery',
            accessStart: 'Access start time',
            accessEnd: 'Access end time',
            orderID: 'Order identifier from Retailer',
            orderUrl: 'URL showing details of the order',
            trackingID: 'Visit identifier from Access Grantee',
            trackingUrl: 'Tracking URL for the order',
            houseID: 'House ID',
            accessPartnerName: 'Access partner name',
            accessPartnerLogoURL: 'Access partner logo URL',
            sellerPartnerName: 'Seller partner name',
            sellerPartnerLogoURL: 'Seller partner logo URL'
          }
        ]
      },
      permissions: [],
      note: 'window can be [current|past] to list current/upcoming or past deliveries, respectively',
    },
    'DELETE /homeaccess/token/:lockID': {
      name: 'Revoke Home-Access-Token',
      summary: 'Allows a retailer/seller partner to revoke a Home-Access-Token',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      permissions: [],
      note: '',
    },
    'POST /partners/ujet/auth': {
      name: 'UJet auth request',
      summary: 'Called by an authenticated user to generate a JWT for UJet end user authentication',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          token: '<string: JWT>'
          // Decoded, the token will look like this:
          // {
          //   "identifier": <string: user ID>,
          //   "name": <string: user first and last name>,
          //   "email": <string: user email>,
          //   "phone": <string: user phone>,
          //   "customData": {
          //     "toolsURL": {
          //       "label": "Tools URL",
          //       "value": <string: URL for the user on the tools site>,
          //       "type": "string"
          //     }
          //   },
          //   "iss": "August Home",
          //   "iat": <number: when the token was issued, in epoch seconds.>,
          //   "exp": <number: when the token expires, in epoch seconds.>
          // }
        }
      },
      note: ''
    },
    'POST /partners/ujet/sign': {
      name: 'UJet sign request',
      summary: 'Called by an authenticated user to generate jwt for custom data',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: { // Any data passed in the request body will be included in the JWT token.
          banana: 'phone',
          blueberry: 'spice head',
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          token: '<string: JWT>'
          // Decoded, the token will look like this:
          // {
          //   "banana": "phone",
          //   "blueberry": "spice head",
          //   "iss": "August Home",
          //   "iat": <number: when the token was issued, in epoch seconds.>,
          //   "exp": <number: when the token expires, in epoch seconds.>
          // }
        }
      },
      note: ''
    },
    'GET /credentials': {
      name: 'Credentials api for mobile clients',
      summary: 'Called by an authenticated user to get all the credentials needed for mobile clients',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          turn: {
            user: 'turn user',
            password: 'turn password',
            stunServers: [ 'host0:port0', 'host1:port1' /* ... */ ],
            turnServers: [ 'host0:port0', 'host1:port1' /* ... */ ],
          },
          ujet_key: 'ujet api key',
        }
      },
      permissions: ['credentials'],
      note: ''
    },
    'GET /devices': {
      name: 'Get Devices',
      summary: 'Get a list of calling user\'s devices.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          locks: ['<lockIDs>'],
          doorbells: ['<doorbellIDs>'],
          keypads: ['<keypadIDs>'],
          bridges: ['<bridgeIDs>'],
          chimes: ['<chimeIDs>'],
        }
      },
      note: 'Returns a device type key and empty array if the calling user has no devices of that type.'
    },
    'GET /devices/capabilities': {
      name: 'Get the capabilities for a device',
      summary: 'Get the capabilities for a device',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          optional: {
            hhID: 'Host Hardware Identifier',
            udID: 'Universal Device Identifier',
            hID: 'Host Identifier',
          },
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          lock: { // if the device is a lock
            // capabilities
            hostHardwareLockInfo: { // if universalDeviceID is parameter
              // This is usually the physical hardware with no electronics
              // host hardware lock capabilities
            },
            hostLock: { // if the device is using a Unity module.
              // host lock capabilities
            }
          },
          doorbell: { // if the device is a doorbell
            // capabilities
          },
          connect: { // if the device is a connect
            // capabilities
          },
          keypad: { // if the device is a keypad
            // capabilities
          },
        },
      },
      note: 'The response body may contain capabilities for multiple device types.  e.g. lock and keypad for Unity devices with a keypad.',
    },
    'GET /devices/questionnaire/:questionnaireID': {
      name: 'Get the questionnaire for a device version',
      summary: 'Get the questionnaire for a device version',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          firstQuestion: "screenOne",
          screenOne: {
            titleText: 'Title of current screen',
            backgroundImageName: 'Name of background image',
            lottieAnimationName: 'Name of animation', //Mobile is planning on storing the images locally
            questionText: 'The question this screen asks',
            answers: [
              {
                text: 'Displayed first option',
                destination: 'screenTwo', //The value of another screen
              },
              {
                text: 'Displayed second option',
                destination: 'screenThree', //The value of another screen
              },
            ]
          },
          screenTwo: {
            titleText: 'Title of current screen',
            backgroundImageName: 'Name of background image',
            lottieAnimationName: 'Name of animation', //Mobile is planning on storing the images locally
            questionText: 'The question this screen asks',
            answers: [
              {
                text: 'Displayed first option',
                destination: 'screenThree', //The value of another screen
              },
              {
                text: "No, the door stays latched",
                type: "HostID",
                value: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
              }
            ]
          },
        },
      },
      note: 'Once we get to the final question/answer, instead of destination, there will be a type and value',
    },
    'POST /doorbells/:doorbellID/chimes': {
      name: 'Chime setup',
      summary: 'Called by client apps when a user sets up a chime.',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          doorbellID: 'ID of doorbell being associated with the chime.',
          serialNumber: 'Serial number of the chime.',
          name: 'Name of the chime',
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          doorbellID: 'ID of doorbell being associated with the chime.',
          serialNumber: 'Serial number of the chime.',
          type: 'Which version of the chime is being setup.',
          name: 'Name of the chime',
        },
      },
      note: '',
    },
    'PUT /doorbells/:doorbellID/chimes/:chimeID': {
      name: 'Chime update',
      summary: 'Called by client apps when a user renames a chime.',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          name: 'New name of the chime',
        },
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'Return 404 not found if the doorbell is not setup.  Return 403 unauthorized if the calling user cannot manage the doorbell.  Return 404 not found if the chime is not setup.',
    },
    'GET /doorbells/:doorbellID/chimes/:chimeID': {
      name: 'Get chime',
      summary: 'Get information about a chime.',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          chimeID: 'ID of the chime.',
          serialNumber: 'Serial number of the chime.',
          type: 'Which version of the chime is being setup.',
          name: 'Name of the chime',
          firmware: 'Version of firmware (semver)',
          settings: {
            doorbellTune: '<number> tune number [1,2,3,4] to play on doorbell press. 0 = off',
            motionTune: '<number> tune number [1,2,3,4] to play on motion event, 0 = off',
            volume: '<number> volume level (0 to 4 inclusive) ',
            doorbellLed: '<boolean>',
            motionLed: '<boolean>',
            settings0: 'value0',
            settings1: 'value1',
            // ...
            settingsN: 'valueN',
          }
        },
      },
      note: '',
    },
    'DELETE /doorbells/:doorbellID/chimes/:chimeID': {
      name: 'Delete chime',
      summary: 'Delete chime.',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'Return 403 unauthorized if the calling user cannot manage the doorbell.  Return 404 not found if the chime is not setup.',
    },
    'PUT /doorbells/:doorbellID/chimes/:chimeID/settings': {
      name: 'Update Chime Settings',
      summary: 'Update Chime Settings',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          setting1: 'value of setting 1',
          setting2: 'value of setting 2',
          // etc.
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Must put the whole settings object.  Cannot update individual fields.'
    },
    'GET /doorbells/:doorbellID/chimes/:chimeID/settings': {
      name: 'Get Chime Settings',
      summary: 'Get Chime Settings',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          doorbellTune: '<number> tune number [1,2,3,4] to play on doorbell press. 0 = off',
          motionTune: '<number> tune number [1,2,3,4] to play on motion event, 0 = off',
          volume: '<number> volume level (0 to 4 inclusive) ',
          doorbellLed: '<boolean>',
          motionLed: '<boolean>',
          setting1: 'value of setting 1',
          setting2: 'value of setting 2',
          // etc.
        }
      },
      note: '',
    },
    'POST /doorbells/:doorbellID/webrtcsignal': {
      name: 'Send sdp offer and receive spd answer from a webrtc enabled doorbell',
      summary: 'Sends sdp offer by proxying pubnub messages to the doorbell and awaits an sdp answer on that pubnub channel.  That sdp answer is returned to the caller.',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          offer: 'sdp offer string with "\r\n" newline delimeters',
          clientTransactionID: 'identifier sent by the client to trace transaction',
          optional: {
            timeoutMs: 'milliseconds to wait for a pubnub response, 30000 max, 5000 default',
          }
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          answer: 'sdp answer string'
        }
      },
      note: 'Error Codes:\n' +
      '403 NotAuthorized - user is not authorized to access doorbell\n' +
      '404 ResourceNotFound - doorbellID not found\n' +
      '408 RequestTimeoutError - Doorbell cannot wakeup || receives incorrectly formatted sdp offer || doorbell is not listening on the pubnub channel message was published to || doorbell is offline and has not yet been reported by server (15 minute window)\n' +
      '409 ConflictError - doorbell has firmware that does not support webrtc || has not set the "caps" property with "webrtc"\n' +
      '409 MissingParameter - missing body parameter "offer" or "clientTransactionID"\n' +
      '422 UnprocessableEntityError - doorbell status is offline\n' +
      '500 InternalServerError - other internal server error\n'
    },
    'PUT /doorbells/:doorbellID/tcpwakeup': {
      name: 'Wake a tcp connected device',
      summary: 'Wake a tcp connected device',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'Status Codes:\n' +
      '200 OK - Device already online\n' +
      '202 Accepted - Doorbell was in standby mode and is being woken up\n' +
      '404 ResourceNotFound - doorbellID not found\n' +
      '412 Precondition Failed - device not connected to tcp keep alive server || device is offline ||\n' +
            'Doorbell does not support tcp keep alive || wakeup token not set || invalid doorbell status\n' +
      '500 InternalServerError - other internal server error\n'
    },
    'DELETE /users/:userID': {
      name: 'Delete a user account',
      summary: 'Delete a user account.  The userID must match the one in the access token.',
      method: 'delete',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Status Codes:\n' +
      '401 InvalidCredentialsError\n' +
      '  - The userID does not match the one in the access token.\n' +
      '  - The access token is invalid.\n' +
      '  - The user is blacklisted.',
    },
    'GET /brands/urls/:brand/:country/:language/:urlID': {
      name: 'Get brand and locale specific URLs',
      summary: 'Get brand and locale specific URLs',
      method: 'GET',
      request: {
        headers: {},
        parameters: {
          brand: 'Brand, such as august or yale',
          country: 'Country code',
          language: 'Language code',
          urlID: 'URL string identifier'
        }
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'Status Codes:\n' +
        '301 - Success/redirect to URL' +
        '400 - Invalid brand' +
        '404 - Link not found'
    },
    'POST /users/:userID/orchestra-accesses': {
      name: 'Add user to orchestra',
      summary: 'Add user to orchestra. The user is then linked and has a new property `orchestraCustomerId`',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders,
      },
      note: 'Error Codes:\n' +
      '412 PreconditionFailedError - user already linked to orchestra\n' +
      '500 InternalServerError - other internal server error'
    },
    'DELETE /users/:userID/orchestra-accesses': {
      name: 'Remove user to orchestra',
      summary: 'Remove user to orchestra.  The userID must match the one in the access token.',
      method: 'delete',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Status Codes:\n' +
      '401 InvalidCredentialsError\n' +
      '  - The userID does not match the one in the access token.\n' +
      '  - The access token is invalid.\n' +
      '  - The user is blacklisted.\n' +
      '412 PreconditionFailedError - user not linked to orchestra'
    },
    'GET /orchestra-accesses': {
      name: 'Get user accesses and credentials to orchestra',
      summary: 'Get user accesses and credentials to orchestra',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Status Codes:\n' +
      '401 InvalidCredentialsError\n' +
      '  - The userID does not match the one in the access token.\n' +
      '  - The access token is invalid.\n' +
      '  - The user is blacklisted.\n' +
      '412 PreconditionFailedError - user not linked to orchestra'
    },
    'PUT /orchestra-accesses/:accessID': {
      name: 'Update access to orchestra',
      summary: 'Update access to orchestra',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders,
        body: {
          granted: 'boolean to respond to an access request',
          lockID: 'lockID associated with the access request. Required if granted is true.',
        }
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Status Codes:\n' +
      '400 BadRequestError - params and body do not match schema\n' +
      '401 InvalidCredentialsError\n' +
      '  - The userID does not match the one in the access token.\n' +
      '  - The access token is invalid.\n' +
      '  - The user is blacklisted.\n' +
      '403 PreconditionFailedError - user does not owns access\n' +
      '404 ResourceNotFoundError - access not found'
    },
    'DELETE /orchestra-accesses/:accessID': {
      name: 'Delete access to orchestra',
      summary: "Delete access to orchestra with it's credentials",
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Status Codes:\n' +
      '400 BadRequestError - params do not match schema\n' +
      '401 InvalidCredentialsError\n' +
      '  - The userID does not match the one in the access token.\n' +
      '  - The access token is invalid.\n' +
      '  - The user is blacklisted.\n' +
      '403 PreconditionFailedError - user does not owns access\n' +
      '404 ResourceNotFoundError - access not found'
    },
    'DELETE /orchestra-accesses/:accessID/credentials/:credentialID': {
      name: 'Delete credential to orchestra',
      summary: "Delete credential to orchestra",
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders,
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Status Codes:\n' +
      '400 BadRequestError - params do not match schema\n' +
      '401 InvalidCredentialsError\n' +
      '  - The userID does not match the one in the access token.\n' +
      '  - The access token is invalid.\n' +
      '  - The user is blacklisted.\n' +
      '403 NotAuthorizedError\n' +
      '  - user does not owns access\n' +
      '  - credential does not belongs to the access\n' +
      '404 ResourceNotFoundError\n' +
      '  - access not found\n' +
      '  - credential not found'
    },
  },
  '2.0.0': {
    'POST /smartalert/rules': {
      name: 'Create smart alert rule',
      summary: 'Creates smart alert with optional schedule',
      method: 'POST',
      request: {
        headers: standardRequestHeaders,
        body: {
          deviceID: 'Id of device associated with smart alert',
          deviceType: 'Type of device to associate smart alert with',
          otherUserID: 'User id or system user',
          schedule: 'optional ICAL schedule'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          ruleID: 'string'
        }
      },
      note: 'The user to be notified by this alert is the calling user'
    },
    'GET /smartalert/rules/:ruleID': {
      name: 'Return smart alert rule',
      summary: 'Returns smart alert rule per given rule id',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          deviceID: 'Id of device associated with smart alert',
          devceType: 'Type of device assocaited with smart alert',
          notifyUserID: 'Id of user to be notified with smart alert',
          otherUserID: 'User id or system user',
          schedule: 'optional ICAL schedule; may be omitted if not given'
        }
      },
      note: 'notifyUserID is always calling user'
    },
    'DELETE /smartalert/rules/:ruleID': {
      name: 'Deletes smart alert rule',
      summary: 'Deletes smart alert rule per given rule id',
      method: 'DELETE',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders
      },
      note: 'Marks rule as deleted; document is kept in db'
    },
    'GET /smartalert/rules': {
      name: 'Gets smart alert rules',
      summary: 'Get smart alert rule per given query',
      method: 'GET',
      request: {
        headers: standardRequestHeaders,
        query: {
          deviceID: 'Id of device to return smart alert rules for'
        }
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          ruleID: 'Id of first rule',
          notifyUserID: 'Id of user to be notified with smart alert',
          otherUserID: 'User id or system user',
          schedule: 'optional ICAL schedule; may be omitted if not given'
        }, {
          ruleID: 'Id of second rule',
          notifyUserID: 'Id of user to be notified with smart alert',
          otherUserID: 'User id or system user',
          schedule: 'optional ICAL schedule; may be omitted if not given'
        }
        // ...
        ]
      },
      note: 'When no query provided end point returns all smart alert rules associated with calling user'
    },
    'PUT /smartalert/rules/:ruleID': {
      name: 'Updates smart alert rule',
      summary: 'Updates schedule of smart alert rule per given rule id',
      method: 'PUT',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          schedule: 'optional ICAL schedule; may be omitted if not given'
        }
      },
      note: 'If schedule is not in body, schedule will be deleted in db'
    },
    'GET /partners': {
      name: 'get August Access partner offerings',
      summary: 'retrives a list of service offerings from partners that integrate with August',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        headers: standardResponseHeaders,
        body: [{
          _id: 'ID of partner',
          name: 'name of partner',
          heroImageURL: 'URL to partner hero image',
          partnerURL: 'URL to partner homepage',
          logoURL: 'URL to partner logo',
          wordmarkURL: 'URL to partner wordmark',
          partnerTagline: 'partner tagline',
          jointTagline: 'tagline tailored to August',
          partnerDescription: 'company description',
          jointDescription: 'service offering description',
          promotion: 'available partnership promotions',
          locations: 'where the service is provided',
        }]
      },
      note: ''
    },
    'POST /locks': { // path
      name: 'Add Lock',
      summary: 'Adds a lock to a house.',
      method: 'post',
      request: {
        headers: standardRequestHeaders,
        body: {
          required: {
            houseID: 'house id of the house where we wants to add the lock',
            serialNumber: 'serial number of lock [see notes]',
            LockIDs: 'unique identifiers of advertising locks [see notes]',
            LockName: 'name of lock'
          },
          optional: {
            hostHardwareID: 'Host hardware\'s ID'
          }
        },
      },
      response: {
        headers: standardResponseHeaders,
        body: {
          LockID: '<unique ID of lock>',
          LockName: '<Text string>',
          Type: 'Integer',
          Updated: 'YYYY-MM-DDTHH:MM:SS.mmmZ',
          Created: 'YYYY-MM-DDTHH:MM:SS.mmmZ',
          HouseID: 'ID of house to which lock was added'
        },
      },
      note: 'Requestor must provide the serial number of the lock and a list of all afvertising locks.' +
        'If LockID or Name are not present, a Bad Request error is returned.' +
        'If the user is not a manager or superuser of the house, a Not Authorized error is returned.' +
        'If the serial number does not match any of the advertising locks, a Not Authorized error is returned.' +
        'If hostHardwareID is provided but does not exist, 404 ResourceNotFound'
    },
    'GET /subscriptions': {
      name: 'GET subscriptions',
      summary: 'Returns subscriptions the calling user has access to',
      method: 'GET',
      request: {
        headers: standardRequestHeaders
      },
      response: {
        body: [{
          subscriptionID: 'subscription ID',
          userID: 'subscription manager user ID',
          type: 'type of subscription',
          status: 'trial/paid/invalid',
          deviceType: 'device',
          deviceID: 'device ID'
        }]
      },
      note: 'Returns house-level subscription.'
    }
  }
};

var private_spec = {
  protocol: 'https',
  port: 3030,
  paths: privatePaths
};

var all_spec = {
  protocol: 'https',
  port: 3030,
  paths: _.merge({}, publicPaths, privatePaths),
};

module.exports = {
  get api_spec() {
    return public_spec;
  },
  get api_private() {
    return private_spec;
  },
  get api_all_spec() {
    return all_spec;
  },
  getPathSpec(apiVersion, routePath) {
    return _.get(all_spec.paths, [apiVersion, routePath]);
  },
  getRequestBody(apiVersion, routePath) {
    return _.get(this.getPathSpec(apiVersion, routePath), 'request.body');
  },
  getResponseBody(apiVersion, routePath) {
    return _.get(this.getPathSpec(apiVersion, routePath), 'response.body');
  },
};
