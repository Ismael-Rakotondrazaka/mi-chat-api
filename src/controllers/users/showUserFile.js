const showUserFile = (req, res, next) => {
  try {
    const targetUserId = +req.params.userId;
    const filename = req.params.filename;

    return res.redirect(
      `${process.env.GCS_BUCKET_ENTRY_POINT}/public/users/${targetUserId}/${filename}`
    );
  } catch (error) {
    next(error);
  }
};

export { showUserFile };
