const express = require('express');
const controller = require('../controller/connectionController');
const {isLoggedIn, isAuthor} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validator');
const {validateConnection, validateResult, isValidRsvp, isuserConnection} = require('../middlewares/validator');

const router = express.Router();

router.get('/', controller.connections);

router.get('/newConnection', isLoggedIn, controller.newConnection);

router.post('/', isLoggedIn, validateConnection, validateResult, controller.create);

router.get('/:id',  validateId, controller.show);

router.get('/:id/edit', isLoggedIn, validateId, isAuthor, controller.edit);

router.put('/:id', validateId, isLoggedIn, isAuthor, validateConnection, validateResult, controller.update);

router.delete('/:id', validateId, isLoggedIn, isAuthor, controller.delete);

//rsvp for connection
router.post('/:id/rsvp', validateId, isLoggedIn, isValidRsvp, isuserConnection, controller.createRsvp);

//rsvp maybe for connection
router.post('/:id/rsvpDel', validateId, isLoggedIn, controller.deleteRSVP);

module.exports = router;