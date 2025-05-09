A subset of the CODAP code is duplicated in the `src/codap` folder.

The files can be updated from the CODAP code by running `rsync -av --existing --delete ../codap/v3/src/ src/codap/` at the top level of the dst plugin repository. The command assumes you have codap checked out in the same parent folder as the dst plugin. It will only copy over files that already exist in the dst plugin's `src/codap` folder. It will also override any changes made in the dst plugin folder.

It is best to test the plugin after syncing the files to make sure the new CODAP changes don't break the plugin. Also it is useful if we started adding the CODAP commit hash in the comment of the DST plugin commit that brings in the new changes. This way we can manually match up any changes in the copied CODAP source with the same code in the CODAP repository.

If you need to change these `src/codap` files, those changes should be made in the CODAP code base first and then the rsync command run to bring them over. If you need to use additional files from the CODAP source those should be manually copied to the same place in `src/codap`.

If at all possible we shouldn't make custom versions of the files in `src/codap` doing so makes it much hard to keep things up-to-date with CODAP. If we do have to do that then we should explore some git based syncing approaches so it is easier to merge the upstream files.

The CODAP jest test files have not been brought over, and the whole `src/codap` folder is ignored by Codecov.

There are several parts of the CODAP codebase that were brought over just because it was easier to do that instead of refactoring CODAP so those parts can be skipped. The `seperation-todo.md` file documents some of this.